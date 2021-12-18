import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDataDto } from './dtos/user-data.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { compare, hash } from 'bcrypt';
import { ChangeAliasDto } from './dtos/change-alias.dto';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>,
		private readonly tokensService: TokensService
	) {}

	async register(createUserDto: CreateUserDto) {
		try {
			return this.create(createUserDto);
		} catch (e) {
			throw new BadRequestException('Username or email are taken');
		}
	}

	async changePassword(user: UserEntity, changePasswordDto: ChangePasswordDto) {
		await this.verifyPassword(changePasswordDto.oldPassword, user.password);
		const hashedNewPassword = await hash(changePasswordDto.newPassword, 10);
		await this.updateById(user.id, {
			password: hashedNewPassword,
		});

		return { message: 'Password changed successfully' };
	}

	async changeAlias(user: UserEntity, { alias }: ChangeAliasDto) {
		if (user.alias == alias) throw new BadRequestException('Nothing to change');
		await this.updateById(user.id, { alias });
		return { alias };
	}

	async findOne(param: object): Promise<UserEntity | undefined> {
		return await this.userRepo.findOne(param);
	}

	async getById(id: number): Promise<UserEntity> {
		const user = await this.userRepo.findOne({ id });
		if (user) return user;

		throw new BadRequestException('User with this id was not found');
	}

	async create(userData: UserDataDto): Promise<UserEntity> {
		const newUser = await this.userRepo.create(userData);
		return await this.userRepo.save(newUser);
	}

	async updateById(id: number, partialEntity: object) {
		return this.userRepo.update({ id }, partialEntity);
	}

	async verifyPassword(plainTextPassword: string, hashedPassword: string) {
		const isMatching = await compare(plainTextPassword, hashedPassword);
		if (!isMatching) throw new BadRequestException('Wrong password');
	}

	async deleteAccount(id: number) {
		await Promise.all([
			this.userRepo.delete({ id }),
			this.tokensService.deleteTokenByCond({ userId: id }),
		]);

		return { message: 'Account deleted permanently' };
	}
}
