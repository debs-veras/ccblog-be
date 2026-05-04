import { z } from "zod";

export const enrollmentStatusSchema = z.enum([
  "ENROLLED",
  "PASSED",
]);

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid("ID do estudante inválido"),
  disciplineId: z.string().uuid("ID da disciplina inválida"),
  period: z.number().min(0, "Período deve ser maior que 0"),
  status: enrollmentStatusSchema.optional().default("ENROLLED"),
});

export const updateEnrollmentSchema = z.object({
  status: enrollmentStatusSchema,
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
