import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTokens1639219164157 implements MigrationInterface {
    name = 'UpdateTokens1639219164157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "expiresIn"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "expiresIn" bigint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "expiresIn"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "expiresIn" integer NOT NULL`);
    }

}
