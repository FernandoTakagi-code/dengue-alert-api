import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import type { AlertResult } from "./alert.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailAppPassword,
  },
});

export async function enviarAlertaEmail(alerta: AlertResult): Promise<void> {
  if (!alerta.deveAlertar) return;

  const assunto =
    alerta.nivel === "critico"
      ? " ALERTA CRÍTICO: Dengue em Mogi das Cruzes"
      : " ATENÇÃO: Casos de Dengue aumentando em Mogi das Cruzes";

  await transporter.sendMail({
    from: `"Sistema de Alertas Dengue" <${env.emailUser}>`,
    to: env.emailDestinatario,
    subject: assunto,
    html: `
      <h2>${assunto}</h2>
      <p>${alerta.mensagem.replace(/\n/g, "<br>")}</p>
      <hr>
      <h3>Dados da semana ${alerta.dados.semanaAtual}</h3>
      <ul>
        <li><strong>Casos confirmados:</strong> ${alerta.dados.casosAtual}</li>
        <li><strong>Semana anterior:</strong> ${alerta.dados.casosAnterior} casos</li>
        <li><strong>Variação:</strong> ${alerta.dados.variacao > 0 ? "+" : ""}${alerta.dados.variacao}%</li>
        <li><strong>Rt (número reprodutivo):</strong> ${alerta.dados.rt.toFixed(2)}</li>
        <li><strong>Nível de alerta:</strong> ${alerta.dados.nivelAlerta}/4</li>
      </ul>
      <hr>
      <p style="color: gray; font-size: 12px;">
        Sistema de Alertas de Dengue — Mogi das Cruzes<br>
        Dados fornecidos pelo InfoDengue/Mosqlimate
      </p>
    `,
  });
}