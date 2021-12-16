import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailChangeDto {
	@IsNotEmpty()
	@IsString()
	token: string;
}
