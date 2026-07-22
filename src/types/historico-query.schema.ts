import { z } from "zod";

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

export const historicoQuerySchema = z.object({
  start: z
    .string()
    .regex(dateFormatRegex, "start deve estar no formato YYYY-MM-DD")
    .optional(),
  end: z
    .string()
    .regex(dateFormatRegex, "end deve estar no formato YYYY-MM-DD")
    .optional(),
  nivel: z
    .enum(["1", "2", "3", "4"])
    .transform((v) => parseInt(v))
    .optional(),
  casosMin: z
    .string()
    .regex(/^\d+$/, "casosMin deve ser um número inteiro positivo")
    .transform((v) => parseInt(v))
    .optional(),
}).refine(
  (data) => {
    if (data.start && data.end) {
      return new Date(data.start) <= new Date(data.end);
    }
    return true;
  },
  {
    message: "start deve ser anterior ou igual a end",
    path: ["start"],
  }
);

export type HistoricoQueryParams = z.infer<typeof historicoQuerySchema>;