import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangeEmailDto {
	@IsEmail()
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value.toLowerCase())
	newEmail: string;
}
