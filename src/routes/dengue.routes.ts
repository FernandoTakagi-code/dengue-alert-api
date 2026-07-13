import { Router } from "express";
import { dengueQuerySchema } from "../types/dengue-query.schema.js";
import { fetchInfoDengueData } from "../services/infodengue.service.js";
import { saveInfoDengueRecords } from "../services/dengue-storage.service.js";
import { analisarTendencia } from "../services/alert.service.js";
import { enviarAlertaEmail } from "../services/email.service.js";


export const dengueRouter = Router();

const MOGI_DAS_CRUZES_GEOCODE = 3530607;

dengueRouter.get("/mogi-das-cruzes", async (req, res) => {
  const parseResult = dengueQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Parâmetros inválidos",
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { start, end } = parseResult.data;

  try {
    const data = await fetchInfoDengueData({
      geocode: MOGI_DAS_CRUZES_GEOCODE,
      startDate: start,
      endDate: end,
    });

    const { salvos } = await saveInfoDengueRecords(data);

    res.json({
      municipio: "Mogi das Cruzes",
      periodo: { start, end },
      totalRegistros: data.length,
      salvosNoBanco: salvos,
      dados: data,
    });
  } catch (error) {
    res.status(502).json({
      error: "Erro ao buscar ou salvar dados",
    });
  }
});

dengueRouter.get("/mogi-das-cruzes/analise", async (_req, res) => {
  try {
    const resultado = await analisarTendencia(MOGI_DAS_CRUZES_GEOCODE);

    if (resultado.deveAlertar) {
      await enviarAlertaEmail(resultado);
    }

    res.json({
      ...resultado,
      emailEnviado: resultado.deveAlertar,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao analisar tendência",
    });
  }
});