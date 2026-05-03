import { z } from "zod";

// ================== Horários ==================
export const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(4, "Dia da semana inválido (0-6)"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido, ex: 08:00"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido, ex: 10:00"),
}).refine((data) => data.startTime < data.endTime, {
  message: "O horário de início deve ser anterior ao de fim",
  path: ["startTime"],
});

// ================== Criação ==================
export const createDisciplineSchema = z.object({
  name: z.string().min(1, "Nome da disciplina é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  description: z.string().optional(),
  materialUrl: z.union([z.string().url("URL inválida"), z.literal(""), z.null()])
    .optional()
    .transform(val => val === "" || val === null ? undefined : val),
  // período da disciplina (1 a 9)
  period: z.number().min(0).max(9, "Período inválido"),
  // carga horária
  workload: z.number().min(1, "Carga horária inválida"),
  teacherId: z.union([z.string().uuid("ID do professor inválido"), z.literal(""), z.null()])
    .optional()
    .transform(val => val === "" || val === null ? undefined : val),
  schedules: z.array(scheduleSchema).optional(),
  prerequisiteIds: z.array(z.string().uuid()).optional(),
});

// ================== Atualização ==================
export const updateDisciplineSchema = createDisciplineSchema.partial().extend({
  force: z.boolean().optional(),
});

// ================== Tipos TS ==================
export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;

