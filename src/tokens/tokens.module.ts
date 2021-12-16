import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensEntity } from './tokens.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [TypeOrmModule.forFeature([TokensEntity]), ConfigModule],
	providers: [TokensService],
	exports: [TokensService],
})
export class TokensModule {}
