import dotenv from "dotenv";

dotenv.config();


function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT ?? "3000",
  mosqlimateApiKey: getRequiredEnv("MOSQLIMATE_API_KEY"),
};