import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { EmailModule } from './email/email.module';
import * as Joi from 'joi';
import dbconfig from './dbconfig';

@Module({
	imports: [
		TypeOrmModule.forRoot(dbconfig),
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				BASE_FRONTEND_LINK: Joi.string().required(),

				JWT_ACCESS_SECRET: Joi.string().required(),
				JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),

				REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),

				JWT_EMAIL_VERIFICATION_SECRET: Joi.string().required(),
				JWT_EMAIL_VERIFICATION_EXPIRATION_TIME: Joi.string().required(),

				JWT_EMAIL_CHANGE_SECRET: Joi.string().required(),
				JWT_EMAIL_CHANGE_EXPIRATION_TIME: Joi.string().required(),

				JWT_PASSWORD_RESET_SECRET: Joi.string().required(),
				JWT_PASSWORD_RESET_EXPIRATION_TIME: Joi.string().required(),

				EMAIL_SERVICE: Joi.string().required(),
				EMAIL_USER: Joi.string().required(),
				EMAIL_PASSWORD: Joi.string().required(),
			}),
		}),
		UserModule,
		AuthModule,
		TokensModule,
		EmailModule,
	],
})
export class AppModule {}
