import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeAliasDto {
	@IsNotEmpty()
	@IsString()
	alias: string;
}
