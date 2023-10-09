import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TokensEntity } from './tokens.entity';
import { TokenDataDto } from './dto/token-data.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from './interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import ms from '../ms';

@Injectable()
export class TokensService {
	constructor(
		@InjectRepository(TokensEntity)
		private readonly tokensRepo: Repository<TokensEntity>,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	async findByCond(cond: object): Promise<TokensEntity> {
		return this.tokensRepo.findOne(cond);
	}

	async saveToken(tokenData: TokenDataDto): Promise<TokensEntity> {
		const newToken = await this.tokensRepo.create(tokenData);
		await this.tokensRepo.save(newToken);
		return newToken;
	}

	async updateToken(tokenData: TokenDataDto) {
		return this.tokensRepo.update(tokenData.fingerprint, tokenData);
	}

	async deleteTokenByCond(cond: object) {
		return await this.tokensRepo.delete(cond);
	}

	async getNewAccessAndRefreshTokens(userId: number, fingerprint: string) {
		if (!fingerprint) throw new BadRequestException('Fingerprint not provided');
		await this.deleteTokenByCond({ fingerprint });

		const { inSeconds, inMilliseconds } = this.newRefTokenExpireTimes();
		const newRefreshSession = await this.generateNewRefreshSession(
			userId,
			fingerprint,
			inMilliseconds
		);

		const accessToken = await this.generateAccessToken(userId);
		const refreshTokenCookie = this.generateCookieWithRefreshToken(
			newRefreshSession.refreshToken,
			inSeconds
		);

		return {
			accessToken,
			refreshToken: newRefreshSession.refreshToken,
			expiresIn: inSeconds,
		};
	}

	async updateAccessAndRefreshTokens(refreshToken: string, fingerprint: string) {
		if (!refreshToken || !fingerprint) {
			throw new BadRequestException('Refresh token or fingerprint not provided');
		}

		const tokenFromDB = await this.findByCond({ refreshToken });

		await this.verifyRefreshSession(tokenFromDB, fingerprint);
		await this.deleteTokenByCond({ refreshToken });
		const expireTimes = this.newRefTokenExpireTimes();

		const newRefreshSession = await this.generateNewRefreshSession(
			tokenFromDB.userId,
			fingerprint,
			expireTimes.inMilliseconds
		);

		const accessToken = await this.generateAccessToken(tokenFromDB.userId);

		return {
			accessToken,
			refreshToken: newRefreshSession.refreshToken,
			expiresIn: expireTimes.inSeconds,
		};
	}

	async generateAccessToken(id: number) {
		const payload: TokenPayloadInterface = { sub: id };
		return this.jwtService.signAsync(payload);
	}

	generateCookieWithRefreshToken(refreshToken: string, maxAge: number) {
		return `refreshToken=${refreshToken}; HttpOnly; Path=/auth; Max-Age=${maxAge}`;
	}

	async generateNewRefreshSession(
		userId: number,
		fingerprint: string,
		expiresIn: number
	) {
		const newRefreshToken = uuidv4();

		const newRefreshSession = {
			expiresIn,
			refreshToken: newRefreshToken,
			userId: userId,
			fingerprint: fingerprint,
		};

		return await this.saveToken(newRefreshSession);
	}

	async verifyRefreshSession(refreshSession: TokensEntity, fingerprint: string) {
		const nowTime = new Date().getTime();

		if (!refreshSession) {
			throw new UnauthorizedException('Invalid session');
		}

		if (nowTime > refreshSession.expiresIn) {
			await this.deleteTokenByCond({
				refreshToken: refreshSession.refreshToken,
			});
			throw new UnauthorizedException('Session expired');
		}

		if (refreshSession.fingerprint != fingerprint) {
			await this.deleteTokenByCond({
				refreshToken: refreshSession.refreshToken,
			});
			throw new UnauthorizedException('Invalid session. Wrong fingerprint.');
		}
	}

	newRefTokenExpireTimes() {
		const expirationTime = this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME');
		const tokenExpiresTimeInMilliseconds = new Date().getTime() + ms(expirationTime);
		const tokenExpiresTimeInSeconds = parseInt(expirationTime) * 24 * 60 * 60;

		return {
			inMilliseconds: +tokenExpiresTimeInMilliseconds,
			inSeconds: tokenExpiresTimeInSeconds,
		};
	}
}
