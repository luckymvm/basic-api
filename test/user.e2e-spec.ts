import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/user/dtos/create-user.dto';

const testDto: CreateUserDto = {
	email: 'user@email.com',
	username: 'username',
	password: 'passw0rd',
	alias: 'John',
	fingerprint: 'kSo#&vSnV45',
};

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/user/register (POST)', async () => {
		return request(app.getHttpServer())
			.post('/user/register')
			.send(testDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.accessToken).toBeDefined();
				expect(body.refreshToken).toBeDefined();
			});
	});
});
