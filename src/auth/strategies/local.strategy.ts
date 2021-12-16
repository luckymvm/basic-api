import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { Transform } from 'class-transformer';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super();
	}

	async validate(username: string, password: string) {
		const user = {
			username: username.toLowerCase(),
			password,
		};

		return this.authService.getAuthenticatedUser(user);
	}
}
