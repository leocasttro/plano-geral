"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const tarefas_routes_1 = __importDefault(require("./infra/http/routes/tarefas.routes"));
const data_source_1 = require("./infra/database/data-source"); // ajuste esse caminho
async function bootstrap() {
    await data_source_1.AppDataSource.initialize();
    console.log("✅ Database connected");
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: "http://localhost:4200",
    }));
    app.use(express_1.default.json());
    app.use("/tarefas", tarefas_routes_1.default);
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});
