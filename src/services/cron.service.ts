import cron from "node-cron";
import { fetchInfoDengueData } from "./infodengue.service.js";
import { saveInfoDengueRecords } from "./dengue-storage.service.js";
import { analisarTendencia } from "./alert.service.js";
import { enviarAlertaEmail } from "./email.service.js";

const MOGI_DAS_CRUZES_GEOCODE = 3530607;

// Calcula as datas automaticamente: hoje e 4 semanas atrás
function calcularPeriodo(): { start: string; end: string } {
  const hoje = new Date();
  const quatroSemanasAtras = new Date();
  quatroSemanasAtras.setDate(hoje.getDate() - 28);

  // Formata como YYYY-MM-DD (formato que a API espera)
  const formatar = (data: Date): string => data.toISOString().split("T")[0]!;

  return {
    start: formatar(quatroSemanasAtras),
    end: formatar(hoje),
  };
}

async function executarVerificacao(): Promise<void> {
  console.log(`[CRON] Iniciando verificação: ${new Date().toLocaleString("pt-BR")}`);

  try {
    // 1. Calcula período automaticamente
    const { start, end } = calcularPeriodo();
    console.log(`[CRON] Buscando dados de ${start} até ${end}`);

    // 2. Busca dados da API
    const dados = await fetchInfoDengueData({
      geocode: MOGI_DAS_CRUZES_GEOCODE,
      startDate: start,
      endDate: end,
    });

    console.log(`[CRON] ${dados.length} registros recebidos da API`);

    // 3. Persiste no banco
    const { salvos } = await saveInfoDengueRecords(dados);
    console.log(`[CRON] ${salvos} registros salvos/atualizados no banco`);

    // 4. Analisa tendência
    const alerta = await analisarTendencia(MOGI_DAS_CRUZES_GEOCODE);
    console.log(`[CRON] Nível detectado: ${alerta.nivel} | Alertar: ${alerta.deveAlertar}`);

    // 5. Envia e-mail se necessário
    if (alerta.deveAlertar) {
      await enviarAlertaEmail(alerta);
      console.log(`[CRON] E-mail de alerta enviado (nível: ${alerta.nivel})`);
    }

    console.log(`[CRON] Verificação concluída com sucesso`);
  } catch (error) {
    console.error(`[CRON] Erro durante verificação:`, error);
  }
}

export function iniciarCron(): void {
  // Roda todo dia às 8h da manhã
  cron.schedule("0 8 * * *", executarVerificacao, {
    timezone: "America/Sao_Paulo",
  });

  console.log("[CRON] Agendador iniciado — verificação diária às 8h (horário de Brasília)");
}

// Exporta também a função de verificação pra poder testar manualmente via rota
export { executarVerificacao };