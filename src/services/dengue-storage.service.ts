import { prisma } from "../config/prisma.js";
import type { InfoDengueRecord } from "../types/infodengue.js";

// Garante que o município existe no banco antes de salvar registros semanais
// (necessário por causa da FK — não podemos inserir registro sem município)
async function upsertMunicipio(record: InfoDengueRecord): Promise<void> {
  await prisma.municipio.upsert({
    where: { geocodigo: record.municipio_geocodigo },
    update: {
      nome: record.municipio_nome,
      populacao: record.pop,
    },
    create: {
      geocodigo: record.municipio_geocodigo,
      nome: record.municipio_nome,
      populacao: record.pop,
    },
  });
}

// Salva um registro semanal, atualizando se já existir
async function upsertRegistroSemanal(record: InfoDengueRecord): Promise<void> {
  const dataInicio = new Date(record.data_iniSE);

  await prisma.registroSemanal.upsert({
    where: {
      municipioGeocodigo_semanaEpidemiologica: {
        municipioGeocodigo: record.municipio_geocodigo,
        semanaEpidemiologica: record.SE,
      },
    },
    update: {
      casos: record.casos,
      nivelAlerta: record.nivel,
      rt: record.Rt,
      tempMedia: record.tempmed,
      dataInicioSemana: dataInicio,
    },
    create: {
      municipioGeocodigo: record.municipio_geocodigo,
      semanaEpidemiologica: record.SE,
      dataInicioSemana: dataInicio,
      casos: record.casos,
      nivelAlerta: record.nivel,
      rt: record.Rt,
      tempMedia: record.tempmed,
    },
  });
}

// Função principal: recebe array de registros da API e persiste tudo no banco
export async function saveInfoDengueRecords(
  records: InfoDengueRecord[]
): Promise<{ salvos: number }> {
  for (const record of records) {
    // Primeiro garante que o município existe (por causa da FK)
    await upsertMunicipio(record);
    // Depois salva o registro semanal
    await upsertRegistroSemanal(record);
  }

  return { salvos: records.length };
}