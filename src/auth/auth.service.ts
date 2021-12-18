import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { LoginDto } from './dto/login.dto';
import { isEmail } from 'class-validator';
import { UserEntity } from '../user/user.entity';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokensService: TokensService
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
}
