import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokensEntity } from './tokens.entity';
import { TokenDataDto } from './dto/tokenData.dto';
import ms from '../ms';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokensService {
	constructor(
		@InjectRepository(TokensEntity)
		private readonly tokensRepo: Repository<TokensEntity>,
		private readonly configService: ConfigService
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

	async verifyRefreshSessions(oldRefreshSession: TokensEntity, fingerprint: string) {
		const nowTime = new Date().getTime();

		if (!oldRefreshSession) {
			throw new UnauthorizedException('Invalid session');
		}

		if (nowTime > oldRefreshSession.expiresIn) {
			await this.deleteTokenByCond({
				refreshToken: oldRefreshSession.refreshToken,
			});
			throw new UnauthorizedException('Session expired');
		}

		if (oldRefreshSession.fingerprint != fingerprint) {
			await this.deleteTokenByCond({
				refreshToken: oldRefreshSession.refreshToken,
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
