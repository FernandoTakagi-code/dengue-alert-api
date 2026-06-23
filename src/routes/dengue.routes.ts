import { Router } from "express";
import { dengueQuerySchema } from "../types/dengue-query.schema.js";
import { fetchInfoDengueData } from "../services/infodengue.service.js";

export const dengueRouter = Router();

const MOGI_DAS_CRUZES_GEOCODE = 3530607;

dengueRouter.get("/mogi-das-cruzes", async (req, res) => {
  // 1. Valida os query params recebidos
  const parseResult = dengueQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    // .flatten() organiza os erros do Zod num formato mais fácil de ler
    return res.status(400).json({
      error: "Parâmetros inválidos",
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const { start, end } = parseResult.data;

  // 2. Chama o service com os dados já validados e tipados
  try {
    const data = await fetchInfoDengueData({
      geocode: MOGI_DAS_CRUZES_GEOCODE,
      startDate: start,
      endDate: end,
    });

    res.json({
      municipio: "Mogi das Cruzes",
      periodo: { start, end },
      totalRegistros: data.length,
      dados: data,
    });
  } catch (error) {
    res.status(502).json({
      error: "Erro ao buscar dados da fonte externa (InfoDengue)",
    });
  }
});