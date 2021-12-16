import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service';
import { ResetPasswordTokenPayload } from '../interfaces/reset-password-token-payload.interface';
import { UserService } from '../user.service';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { TokensService } from '../../tokens/tokens.service';
import { hash } from 'bcrypt';

@Injectable()
export class ResetPasswordService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
		private readonly userService: UserService,
		private readonly tokensService: TokensService
	) {}

	async sendResetPasswordLink(email: string) {
		const user = await this.userService.findOne({ email });
		if (!user) throw new NotFoundException('User with such email was not found');

		const { jwtSecret, jwtExpiresIn, baseUrl } = this.getBaseConfigParams();
		const payload: ResetPasswordTokenPayload = { email };
		const token = await this.jwtService.signAsync(payload, {
			secret: jwtSecret,
			expiresIn: `${jwtExpiresIn}s`,
		});
		await this.userService.updateById(user.id, { resetPasswordToken: token });

		const url = `${baseUrl}/reset-password?token=${token}`;
		const text = `Password reset link: ${url}`;

		await this.emailService.sendMail({
			to: email,
			subject: 'Password reset',
			text,
		});

		return { message: 'Reset password link sent' };
	}

	async resetPassword({ token, password }: ResetPasswordDto) {
		try {
			const { jwtSecret } = this.getBaseConfigParams();
			const { email } = await this.jwtService.verify(token, {
				secret: jwtSecret,
			});
			const user = await this.userService.findOne({ email });
			const hashedPassword = await hash(password, 10);
			if (user.resetPasswordToken != token) {
				throw new BadRequestException('Wrong reset password token');
			}
			await Promise.all([
				this.userService.updateById(user.id, {
					password: hashedPassword,
					resetPasswordToken: '',
				}),
				this.tokensService.deleteTokenByCond({ userId: user.id }),
			]);

			return { message: 'Password reset successfully' };
		} catch (e) {
			if (e?.name == 'TokenExpiredError') {
				throw new BadRequestException('Reset password token expired');
			}
			throw new BadRequestException('Wrong reset password token');
		}
	}

	getBaseConfigParams() {
		return {
			jwtSecret: this.configService.get('JWT_PASSWORD_RESET_SECRET'),
			jwtExpiresIn: this.configService.get('JWT_PASSWORD_RESET_EXPIRATION_TIME'),
			baseUrl: this.configService.get('BASE_FRONTEND_LINK'),
		};
	}
}
