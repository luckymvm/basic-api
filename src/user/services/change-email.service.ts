import { BadRequestException, Injectable } from '@nestjs/common';
import { ChangeEmailDto } from '../dtos/change-email.dto';
import { UserService } from '../user.service';
import { UserEntity } from '../user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { VerificationTokenPayload } from '../interfaces/verification-token-payload.interface';
import { EmailService } from '../../email/email.service';
import { EmailConfirmationService } from './email-confirmation.service';

@Injectable()
export class ChangeEmailService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		private readonly emailConfirmationService: EmailConfirmationService
	) {}

	async checkNewEmailExist(newEmail: string) {
		const isNewEmailExists = await this.userService.findOne({
			email: newEmail,
		});
		if (isNewEmailExists) {
			throw new BadRequestException('This email address is already taken');
		}
		return isNewEmailExists;
	}

	async setNewEmailInTheDB(id: number, newEmail: string) {
		return this.userService.updateById(id, { newEmail });
	}

	async sendEmailChangeRequestLink(userId: number, email: string) {
		const { jwtSecret, jwtExpiresIn, baseUrl } = this.getBaseConfigParams();
		const payload = { email };
		const token = await this.jwtService.signAsync(payload, {
			secret: jwtSecret,
			expiresIn: `${jwtExpiresIn}s`,
		});
		await this.userService.updateById(userId, {
			changeEmailToken: token,
		});
		const url = `${baseUrl}/confirm-email-change?token=${token}`;
		const text = `Hello, please confirm the change of email: ${url}`;

		await this.emailService.sendMail({
			to: email,
			subject: 'Confirm the change of email address',
			text,
		});

		return {
			message:
				'An email was sent to the current email to confirm the change of email',
		};
	}

	async emailChangeConfirm(token: string) {
		const email = await this.decodeToken(token);
		const userFromDB = await this.userService.findOne({ email });

		if (userFromDB?.changeEmailToken !== token) {
			throw new BadRequestException('Invalid token');
		}

		await Promise.all([
			this.userService.updateById(userFromDB.id, {
				changeEmailToken: '',
				isEmailConfirmed: false,
			}),
			this.emailConfirmationService.sendEmailChangeVerifLink(
				userFromDB.newEmail,
				userFromDB.email
			),
		]);

		return { message: 'Now confirm the new email' };
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
			console.log(email);
			return email;
		} catch (e) {
			if (e?.name == 'TokenExpiredError') {
				throw new BadRequestException('Email Change Token Expired');
			}
			throw new BadRequestException('Bad email change token');
		}
	}

	getBaseConfigParams() {
		return {
			jwtSecret: this.configService.get('JWT_EMAIL_CHANGE_SECRET'),
			jwtExpiresIn: this.configService.get('JWT_EMAIL_CHANGE_EXPIRATION_TIME'),
			baseUrl: this.configService.get('BASE_FRONTEND_LINK'),
		};
	}
}
