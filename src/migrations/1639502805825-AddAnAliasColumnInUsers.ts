import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAnAliasColumnInUsers1639502805825 implements MigrationInterface {
    name = 'AddAnAliasColumnInUsers1639502805825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "alias" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "alias"`);
    }

}
