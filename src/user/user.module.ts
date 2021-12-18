import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../email/email.module';
import { EmailConfirmationService } from './services/email-confirmation.service';
import { UserController } from './user.controller';
import { ResetPasswordService } from './services/reset-password.service';
import { TokensModule } from '../tokens/tokens.module';
import { AuthModule } from '../auth/auth.module';
import { ChangeEmailService } from './services/change-email.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		ConfigModule,
		JwtModule.register({}),
		EmailModule,
		TokensModule,
		forwardRef(() => AuthModule),
	],
	providers: [
		UserService,
		EmailConfirmationService,
		ResetPasswordService,
		ChangeEmailService,
	],
	exports: [UserService],
	controllers: [UserController],
})
export class UserModule {}
