import express from "express";
import dotenv from "dotenv";

dotenv.config(); // carrega as variáveis do .env para process.env

const app = express();
const PORT = process.env.PORT ?? 3000; // usa a env var, ou 3000 como fallback

// Rota de teste - "health check": serve pra confirmar que a API está no ar
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API de alertas de dengue funcionando" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

