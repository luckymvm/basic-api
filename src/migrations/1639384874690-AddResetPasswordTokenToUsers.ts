import {MigrationInterface, QueryRunner} from "typeorm";

export class AddResetPasswordTokenToUsers1639384874690 implements MigrationInterface {
    name = 'AddResetPasswordTokenToUsers1639384874690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordToken"`);
    }

}
