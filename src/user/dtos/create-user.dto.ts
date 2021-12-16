import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail()
	@Transform(({ value }) => value.toLowerCase())
	public email: string;

	@IsNotEmpty()
	@MinLength(3)
	@Transform(({ value }) => value.toLowerCase())
	public username: string;

	@IsNotEmpty()
	@IsString()
	public alias: string;

	@IsNotEmpty()
	@MinLength(8)
	public password: string;

	@IsNotEmpty()
	@IsString()
	public fingerprint: string;
}
