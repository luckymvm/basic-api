import {
	Body,
	Controller,
	Delete,
	HttpCode,
	Post,
	Put,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { EmailConfirmationService } from './services/email-confirmation.service';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUserInterface } from '../auth/interfaces/request-with-user.interface';
import { SendLinkDto } from './dtos/send-reset-password-link.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ResetPasswordService } from './services/reset-password.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './services/user.service';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ChangeAliasDto } from './dtos/change-alias.dto';
import { ChangeEmailService } from './services/change-email.service';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { EmailConfirmationGuard } from './guards/email-confirmation.guard';
import { ConfirmEmailChangeDto } from './dtos/confirm-email-change.dto';
import { TokensService } from '../tokens/tokens.service';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly emailConfirmationService: EmailConfirmationService,
		private readonly resetPasswordService: ResetPasswordService,
		private readonly changeEmailService: ChangeEmailService,
		private readonly authService: AuthService,
		private readonly tokensService: TokensService
	) {}

	@HttpCode(200)
	@Post('register')
	async register(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
		const user = await this.userService.register(createUserDto);
		await this.emailConfirmationService.sendVerificationLink(user.email);
		const { refreshTokenCookie, ...tokens } =
			await this.tokensService.getNewAccessAndRefreshTokens(
				user.id,
				createUserDto.fingerprint
			);

		const res = this.authService.buildResponse(user, tokens);
		response.setHeader('Set-cookie', refreshTokenCookie);
		return response.send(res);
	}

	@HttpCode(200)
	@Post('confirm-email')
	async confirmEmail(@Body() { token }: ConfirmEmailDto) {
		const email = await this.emailConfirmationService.decodeToken(token);
		return this.emailConfirmationService.confirmEmail(email);
	}

	@HttpCode(200)
	@Post('resend-email-confirmation-link')
	@UseGuards(JwtAuthGuard)
	async resendConfirmationLink(@Req() req: RequestWithUserInterface) {
		return this.emailConfirmationService.resendConfirmationLink(req.user.id);
	}

	@HttpCode(200)
	@Post('send-reset-password-link')
	async sendResetPasswordEmail(@Body() { email }: SendLinkDto) {
		return this.resetPasswordService.sendResetPasswordLink(email);
	}

	@HttpCode(200)
	@Post('reset-password')
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.resetPasswordService.resetPassword(resetPasswordDto);
	}

	@HttpCode(200)
	@UseGuards(EmailConfirmationGuard)
	@UseGuards(JwtAuthGuard)
	@Post('email-change-request')
	async sendEmailChangeConfirmationLink(
		@Req() req: RequestWithUserInterface,
		@Body() { newEmail }: ChangeEmailDto
	) {
		await Promise.all([
			this.changeEmailService.checkNewEmailExist(newEmail),
			this.changeEmailService.setNewEmailInTheDB(req.user.id, newEmail),
		]);

		return this.changeEmailService.sendEmailChangeRequestLink(
			req.user.id,
			req.user.email
		);
	}

	@HttpCode(200)
	@Post('confirm-email-change')
	async emailChangeConfirm(@Body() { token }: ConfirmEmailChangeDto) {
		return this.changeEmailService.emailChangeConfirm(token);
	}

	@HttpCode(200)
	@Post('change-password')
	@UseGuards(JwtAuthGuard)
	async changePassword(
		@Req() { user }: RequestWithUserInterface,
		@Body() changePasswordDto: ChangePasswordDto
	) {
		return this.userService.changePassword(user, changePasswordDto);
	}

	@HttpCode(200)
	@Put('change-alias')
	@UseGuards(JwtAuthGuard)
	async changeAlias(
		@Req() req: RequestWithUserInterface,
		@Body() changeAliasDto: ChangeAliasDto
	) {
		return this.userService.changeAlias(req.user, changeAliasDto);
	}

	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@Delete('delete')
	async deleteAccount(@Req() req: RequestWithUserInterface) {
		return this.userService.deleteAccount(req.user.id);
	}
}
