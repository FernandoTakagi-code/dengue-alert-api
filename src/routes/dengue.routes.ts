import { Router } from "express";
import { dengueQuerySchema } from "../types/dengue-query.schema.js";
import { fetchInfoDengueData } from "../services/infodengue.service.js";
import { saveInfoDengueRecords } from "../services/dengue-storage.service.js";
import { analisarTendencia } from "../services/alert.service.js";
import { enviarAlertaEmail } from "../services/email.service.js";
import { historicoQuerySchema } from "../types/historico-query.schema.js";
import { prisma } from "../config/prisma.js";

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

dengueRouter.get("/mogi-das-cruzes/historico", async (req, res) => {
  const parseResult = historicoQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Parâmetros inválidos",
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { start, end, nivel, casosMin } = parseResult.data;

  try {
    const registros = await prisma.registroSemanal.findMany({
      where: {
        ...(start && { dataInicioSemana: { gte: new Date(start) } }),
        ...(end && { dataInicioSemana: { lte: new Date(end) } }),
        ...(nivel && { nivelAlerta: nivel }),
        ...(casosMin && { casos: { gte: casosMin } }),
      },
      orderBy: { semanaEpidemiologica: "desc" },
      include: { municipio: true },
    });

    res.json({
      municipio: "Mogi das Cruzes",
      filtros: { start, end, nivel, casosMin },
      totalRegistros: registros.length,
      dados: registros,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar histórico",
    });
  }
});