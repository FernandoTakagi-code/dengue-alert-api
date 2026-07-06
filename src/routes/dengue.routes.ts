import { Router } from "express";
import { dengueQuerySchema } from "../types/dengue-query.schema.js";
import { fetchInfoDengueData } from "../services/infodengue.service.js";
import { saveInfoDengueRecords } from "../services/dengue-storage.service.js";

export const dengueRouter = Router();

const MOGI_DAS_CRUZES_GEOCODE = 3530607;

dengueRouter.get("/mogi-das-cruzes", async (req, res) => {
  const parseResult = dengueQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Parâmetros inválidos",
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const { start, end } = parseResult.data;

  try {
    // 1. Busca dados da API externa
    const data = await fetchInfoDengueData({
      geocode: MOGI_DAS_CRUZES_GEOCODE,
      startDate: start,
      endDate: end,
    });

    // 2. Persiste no banco
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