"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'plano_geral',
    synchronize: false,
    logging: true,
    entities: [path_1.default.join(__dirname, 'typeorm/entities/**/*.{ts,js}')],
    migrations: [path_1.default.join(__dirname, 'typeorm/migrations/**/*.{ts,js}')],
});
