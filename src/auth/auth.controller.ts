import { Controller, HttpCode, Post, Req, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUserInterface } from './interfaces/requestWithUser.interface';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokensService } from '../tokens/tokens.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokensService: TokensService
	) {}

	@HttpCode(200)
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Req() request: RequestWithUserInterface, @Res() response: Response) {
		const { user } = request;
		const { fingerprint } = request.body;
		const { refreshTokenCookie, ...tokens } =
			await this.tokensService.getNewAccessAndRefreshTokens(user.id, fingerprint);

		const res = this.authService.buildResponse(user, tokens);
		response.setHeader('Set-cookie', refreshTokenCookie);
		return response.send(res);
	}

	@HttpCode(200)
	@Post('refresh')
	async refreshTokens(@Req() req: Request, @Res() res: Response) {
		const refToken = req?.cookies?.refreshToken ?? req?.body?.refreshToken; // 2nd param for requests from a mobile app
		const fingerprint = req?.body?.fingerprint;
		const newTokens = await this.tokensService.updateAccessAndRefreshTokens(
			refToken,
			fingerprint
		);

		res.setHeader('Set-cookie', newTokens.refreshTokenCookie);
		delete newTokens.refreshTokenCookie;
		return res.send(newTokens);
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(@Req() req: RequestWithUserInterface, @Res() res: Response) {
		const refreshToken = req?.cookies?.refreshToken ?? req?.body?.refreshToken;
		const refreshTokenCookie = await this.authService.logoutUser(refreshToken);
		res.setHeader('Set-cookie', refreshTokenCookie);
		return res.sendStatus(200);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	async authenticate(@Req() request: RequestWithUserInterface) {
		return {
			username: request.user.username,
			email: request.user.email,
		};
	}
}
