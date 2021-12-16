import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { compare } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { isEmail } from 'class-validator';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from './interfaces/tokenPayload.interface';
import { v4 as uuidv4 } from 'uuid';
import { TokensService } from '../tokens/tokens.service';
import { TokensEntity } from '../tokens/tokens.entity';
import ms from 'ms';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokensService: TokensService,
		private readonly jwtService: JwtService
	) {}

	async getAuthenticatedUser({ username, password }: LoginDto): Promise<UserEntity> {
		let user: object = { username };
		const checkForEmail = isEmail(username); // we can log in with email or username
		if (checkForEmail) user = { email: username };

		const findUser = await this.userService.findOne(user);
		if (!findUser) throw new BadRequestException('User not found');
		await this.userService.verifyPassword(password, findUser.password);

		return findUser;
	}

	async logoutUser(refreshToken: string) {
		if (!refreshToken) throw new BadRequestException('Please provide refresh token');
		await this.tokensService.deleteTokenByCond({ refreshToken });
		return 'refreshToken=; HttpOnly; Path=/; Max-Age=0';
	}

	buildResponse(user: UserEntity, tokens: object) {
		return {
			...tokens,
			username: user.username,
			email: user.email,
			isEmailConfirmed: user.isEmailConfirmed,
		};
	}

	async getNewAccessAndRefreshTokens(userId: number, fingerprint: string) {
		if (!fingerprint) throw new BadRequestException('Fingerprint not provided');
		await this.tokensService.deleteTokenByCond({ fingerprint });

		const { inSeconds, inMilliseconds } = this.tokensService.newRefTokenExpireTimes();
		const newRefreshSession = await this.tokensService.generateNewRefreshSession(
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
			refreshTokenCookie,
			refreshToken: newRefreshSession.refreshToken,
		};
	}

	async updateAccessAndRefreshTokens(refreshToken: string, fingerprint: string) {
		if (!refreshToken || !fingerprint) {
			throw new BadRequestException('Refresh token or fingerprint not provided');
		}

		const tokenFromDB = await this.tokensService.findByCond({ refreshToken });

		await this.tokensService.verifyRefreshSessions(tokenFromDB, fingerprint);
		await this.tokensService.deleteTokenByCond({ refreshToken });
		const expireTimes = this.tokensService.newRefTokenExpireTimes();

		const newRefreshSession = await this.tokensService.generateNewRefreshSession(
			tokenFromDB.userId,
			fingerprint,
			expireTimes.inMilliseconds
		);

		const accessToken = await this.generateAccessToken(tokenFromDB.userId);
		const refreshTokenCookie = this.generateCookieWithRefreshToken(
			newRefreshSession.refreshToken,
			expireTimes.inSeconds
		);

		return {
			accessToken,
			refreshTokenCookie,
			refreshToken: newRefreshSession.refreshToken,
		};
	}

	async generateAccessToken(id: number) {
		const payload: TokenPayloadInterface = { sub: id };
		return this.jwtService.signAsync(payload);
	}

	generateCookieWithRefreshToken(refreshToken: string, maxAge: number) {
		return `refreshToken=${refreshToken}; HttpOnly; Path=/auth; Max-Age=${maxAge}`;
	}
}
