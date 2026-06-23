import { z } from "zod";

// Regex simples pra checar formato YYYY-MM-DD
const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

export const dengueQuerySchema = z
  .object({
    start: z.string().regex(dateFormatRegex, "start deve estar no formato YYYY-MM-DD"),
    end: z.string().regex(dateFormatRegex, "end deve estar no formato YYYY-MM-DD"),
  })
  .refine((data) => new Date(data.start) <= new Date(data.end), {
    message: "start deve ser uma data anterior ou igual a end",
    path: ["start"],
  })
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      const umAnoEmMs = 365 * 24 * 60 * 60 * 1000;
      return end.getTime() - start.getTime() <= umAnoEmMs;
    },
    {
      message: "O intervalo entre start e end não pode ser maior que 1 ano",
      path: ["end"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start);
      const limiteMinimo = new Date("2010-01-01"); // InfoDengue não tem dados muito antigos
      return start >= limiteMinimo;
    },
    {
      message: "start não pode ser anterior a 2010-01-01",
      path: ["start"],
    }
  )
  .refine(
    (data) => {
      const end = new Date(data.end);
      const hoje = new Date();
      return end <= hoje;
    },
    {
      message: "end não pode ser uma data no futuro",
      path: ["end"],
    }
  );

// Tipo TypeScript inferido automaticamente a partir do schema acima
export type DengueQueryParams = z.infer<typeof dengueQuerySchema>;