import express from "express";
import dotenv from "dotenv";
import {dengueRouter} from "./routes/dengue.routes.js"
import { iniciarCron } from "./services/cron.service.js";
import { executarVerificacao } from "./services/cron.service.js";

dotenv.config(); // carrega as variáveis do .env para process.env

const app = express();
const PORT = process.env.PORT ?? 3000; // usa a env var, ou 3000 como fallback

// Rota de teste - "health check": serve pra confirmar que a API está no ar
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "API de alertas de dengue funcionando" });
});

app.get("/admin/executar-verificacao", async (_req, res) => {
  await executarVerificacao();
  res.json({ message: "Verificação executada — confira o terminal e o e-mail" });
});

app.use("/dengue", dengueRouter);

iniciarCron();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

