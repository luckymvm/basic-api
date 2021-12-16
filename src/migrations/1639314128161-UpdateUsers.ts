import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUsers1639314128161 implements MigrationInterface {
    name = 'UpdateUsers1639314128161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailConfirmed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailConfirmed"`);
    }

}
