"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTarefasTable1762209117066 = void 0;
class CreateTarefasTable1762209117066 {
    constructor() {
        this.name = 'CreateTarefasTable1762209117066';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "tarefas"`);
    }
}
exports.CreateTarefasTable1762209117066 = CreateTarefasTable1762209117066;
