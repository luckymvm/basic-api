import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tokens')
export class TokensEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@Column({ unique: true })
	refreshToken: string;

	@Column()
	fingerprint: string;

	@Column({
		type: 'bigint',
	})
	expiresIn: number;
}
