import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1746700682601 implements MigrationInterface {
    name = 'Initial1746700682601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "portfolio_snapshots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" character varying NOT NULL, "walletAddress" character varying NOT NULL, "data" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_46c13ef40300b3a6d379488f53a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_walletAddress" ON "portfolio_snapshots" ("walletAddress")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_walletAddress"`);
        await queryRunner.query(`DROP TABLE "portfolio_snapshots"`);
    }

}
