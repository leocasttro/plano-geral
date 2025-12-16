import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTarefasTable1762209117066 implements MigrationInterface {
    name = 'CreateTarefasTable1762209117066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tb_tarefas" (
                "id" SERIAL PRIMARY KEY,
                "titulo" VARCHAR(255) NOT NULL,
                "descricao" TEXT,
                "status" VARCHAR(50) NOT NULL DEFAULT 'pendente',
                "responsavel" VARCHAR(100),
                "dataCriacao" TIMESTAMP NOT NULL DEFAULT now(),
                "urlImagem" TEXT,
                "badgeClasseCor" VARCHAR(50),
                "badgeTexto" VARCHAR(50),
                "checklist" JSONB DEFAULT '[]'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tarefas"`);
    }
}
