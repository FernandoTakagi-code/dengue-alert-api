import { prisma } from "../config/prisma.js";

interface AlertResult {
  deveAlertar: boolean;
  nivel: "critico" | "atencao" | "normal";
  mensagem: string;
  dados: {
    semanaAtual: number;
    casosAtual: number;
    casosAnterior: number;
    variacao: number; // percentual de variação
    rt: number;
    nivelAlerta: number;
  };
}

export async function analisarTendencia(
  geocodigo: number
): Promise<AlertResult> {
  // Busca as 2 semanas mais recentes do município no banco
  const registros = await prisma.registroSemanal.findMany({
    where: { municipioGeocodigo: geocodigo },
    orderBy: { semanaEpidemiologica: "desc" },
    take: 2, // só as 2 mais recentes
  });

  // Se não tem dados suficientes, não conseguimos calcular tendência
  if (registros.length < 2) {
    return {
      deveAlertar: false,
      nivel: "normal",
      mensagem: "Dados insuficientes para análise de tendência",
      dados: {
        semanaAtual: 0,
        casosAtual: 0,
        casosAnterior: 0,
        variacao: 0,
        rt: 0,
        nivelAlerta: 0,
      },
    };
  }

  const atual = registros[0]!;
  const anterior = registros[1]!;

  const variacao =
    anterior.casos > 0
      ? ((atual.casos - anterior.casos) / anterior.casos) * 100
      : 0;

  const crescendo = atual.casos > anterior.casos;
  const nivelAltoOuCritico = atual.nivelAlerta >= 3;
  const transmissaoEmExpansao = atual.rt > 1;

  const dados = {
    semanaAtual: atual.semanaEpidemiologica,
    casosAtual: atual.casos,
    casosAnterior: anterior.casos,
    variacao: Math.round(variacao),
    rt: atual.rt,
    nivelAlerta: atual.nivelAlerta,
  };

  // Regra 1: todas as 3 condições — situação crítica
  if (nivelAltoOuCritico && crescendo && transmissaoEmExpansao) {
    return {
      deveAlertar: true,
      nivel: "critico",
      mensagem: ` ALERTA CRÍTICO: Dengue em expansão em Mogi das Cruzes. 
        Semana ${atual.semanaEpidemiologica}: ${atual.casos} casos (${variacao > 0 ? "+" : ""}${Math.round(variacao)}% em relação à semana anterior). 
        Rt=${atual.rt.toFixed(2)}, Nível de alerta: ${atual.nivelAlerta}/4.`,
      dados,
    };
  }

  // Regra 2: crescendo mas Rt < 1 — atenção
  if (nivelAltoOuCritico && crescendo) {
    return {
      deveAlertar: true,
      nivel: "atencao",
      mensagem: ` ATENÇÃO: Casos de dengue aumentando em Mogi das Cruzes.
        Semana ${atual.semanaEpidemiologica}: ${atual.casos} casos (${variacao > 0 ? "+" : ""}${Math.round(variacao)}% em relação à semana anterior).
        Rt=${atual.rt.toFixed(2)}, Nível de alerta: ${atual.nivelAlerta}/4.`,
      dados,
    };
  }

  return {
    deveAlertar: false,
    nivel: "normal",
    mensagem: `Situação estável ou melhorando. ${atual.casos} casos na semana ${atual.semanaEpidemiologica}.`,
    dados,
  };
}