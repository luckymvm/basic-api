import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { hash } from 'bcrypt';

@Entity({ name: 'users' })
export class UserEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ unique: true })
	public email: string;

	@Column({ unique: true })
	public username: string;

	@Column()
	public alias: string;

	@Column()
	public password: string;

	@Column({ default: null })
	public newEmail: string;

	@Column({ default: null })
	public changeEmailToken: string;

	@Column({ default: false })
	public isEmailConfirmed: boolean;

	@Column({ default: null })
	public resetPasswordToken: string;

	@BeforeInsert()
	async transform() {
		this.password = await hash(this.password, 10);
		this.email = this.email.toLowerCase();
		this.username = this.username.toLowerCase();
	}
}
