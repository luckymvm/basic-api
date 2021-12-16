import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
	@IsNotEmpty()
	@Transform(({ value }) => value.toLowerCase())
	username: string;

	@IsNotEmpty()
	password: string;
}
