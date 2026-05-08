import { z } from "zod";

export const registerPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid("ID de categoria inválido").optional().nullable(),
  authorId: z.string().uuid("ID de autor inválido"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").optional(),
  description: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório").optional(),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    )
    .optional(),
  published: z.boolean().optional(),
  categoryId: z.string().uuid("ID de categoria inválido").optional(),
});

export type RegisterPostInput = z.infer<typeof registerPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
