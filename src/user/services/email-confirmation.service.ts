import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../email/email.service';
import { VerificationTokenPayload } from '../interfaces/verification-token-payload.interface';
import { UserService } from './user.service';

@Injectable()
export class EmailConfirmationService {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		private readonly userService: UserService
	) {}

	async sendVerificationLink(email: string) {
		const { baseUrl } = this.getBaseConfigParams();
		const token = await this.signToken({ email });
		const url = `${baseUrl}/confirm-email?token=${token}`;
		const text = `Hi, please confirm your E-mail address: ${url}`;

		try {
			return await this.emailService.sendMail({
				to: email,
				subject: 'Confirm E-mail address',
				text,
			});
		} catch (e) {
			return 'cannot send an email';
		}
	}

	async sendEmailChangeVerifLink(newEmail: string, email: string) {
		const { baseUrl } = this.getBaseConfigParams();
		const token = await this.signToken({ email });
		const url = `${baseUrl}/confirm-email?token=${token}`;
		const text = `Hi, please confirm your email to finish changing your email: ${url}`;

		return this.emailService.sendMail({
			to: newEmail,
			subject: 'Confirm the change of email address',
			text,
		});
	}

	async signToken(payload: VerificationTokenPayload) {
		const { jwtSecret, jwtExpiresIn } = this.getBaseConfigParams();
		return this.jwtService.signAsync(payload, {
			secret: jwtSecret,
			expiresIn: `${jwtExpiresIn}s`,
		});
	}

	async decodeToken(token: string) {
		try {
			const { jwtSecret } = this.getBaseConfigParams();
			const { email } = await this.jwtService.verify(token, {
				secret: jwtSecret,
			});

			return email;
		} catch (e) {
			if (e?.name == 'TokenExpiredError') {
				throw new BadRequestException('Confirmation token expired');
			}
			console.log(e);
			throw new BadRequestException('Bad confirmation token');
		}
	}

	async confirmEmail(email: string) {
		const user = await this.userService.findOne({ email });
		if (user.isEmailConfirmed) {
			throw new BadRequestException('Email already confirmed');
		} else if (user.newEmail) {
			await this.userService.updateById(user.id, {
				isEmailConfirmed: true,
				email: user.newEmail,
				newEmail: '',
			});

			return { message: 'Email confirmed successfully' };
		}

		await this.userService.updateById(user.id, {
			isEmailConfirmed: true,
			newEmail: '',
		});

		return { message: 'Email confirmed successfully' };
	}

	async resendConfirmationLink(id: number) {
		const user = await this.userService.findOne({ id });
		if (user.isEmailConfirmed) {
			throw new BadRequestException('Email already confirmed');
		}
		await this.sendVerificationLink(user.email);
		return { message: 'New link has been sent to confirm email' };
	}

	getBaseConfigParams() {
		return {
			jwtSecret: this.configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
			jwtExpiresIn: this.configService.get(
				'JWT_EMAIL_VERIFICATION_EXPIRATION_TIME'
			),
			baseUrl: this.configService.get('BASE_FRONTEND_LINK'),
		};
	}
}
