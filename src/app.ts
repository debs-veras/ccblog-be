import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorMiddleware } from "middleware/error.middleware";
// cria a app express com tipo explícito
const app = express();
app.use(express.json());
// middlewares globais
app.use(cors());
// registra rotas
app.use("/", routes);
// middleware de erro deve ser registrado DEPOIS das rotas
app.use(errorMiddleware);

export default app;
