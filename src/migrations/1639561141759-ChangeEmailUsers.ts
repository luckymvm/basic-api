import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeEmailUsers1639561141759 implements MigrationInterface {
    name = 'ChangeEmailUsers1639561141759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "newEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "changeEmailToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "changeEmailToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "newEmail"`);
    }

}
