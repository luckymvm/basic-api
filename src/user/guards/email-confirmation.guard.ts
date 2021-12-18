import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUserInterface } from '../../auth/interfaces/request-with-user.interface';

@Injectable()
export class EmailConfirmationGuard implements CanActivate {
	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<RequestWithUserInterface>();
		console.log(request.user);
		if (!request.user?.isEmailConfirmed) {
			throw new UnauthorizedException('Confirm your email first');
		}

		return true;
	}
}
