import { z } from "zod";

// Schema de registro/criação de usuário
export const registerUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "STUDENT", "TEACHER"]).optional(),
});

// Schema de atualização de usuário (sem senha e sem email)
export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  role: z.enum(["ADMIN", "STUDENT", "TEACHER"]).optional(),
  avatarUrl: z.string().nullable().optional(),
});

// Tipos inferidos automaticamente dos schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
