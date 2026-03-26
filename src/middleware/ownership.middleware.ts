import { Request, Response, NextFunction } from "express";
import { sendError } from "../util/response";
import { prisma } from "lib/prisma";
/**
 * Middleware para verificar se o usuário é dono do recurso
 * ADMINs sempre têm acesso
 */
export const ownershipMiddleware = (resourceType: "post" | "user") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, "Usuário não autenticado", 401);
    // ADMINs têm acesso total
    if (req.user.role === "ADMIN") return next();

    const paramId = req.params.id || req.params.authorId;
    const resourceId = Array.isArray(paramId)
      ? paramId[0]
      : paramId;
      
    if (!resourceId) return sendError(res, "ID do recurso não fornecido", 400);

    try {
      let isOwner = false;

      if (resourceType === "post") {
        const post = await prisma.post.findUnique({
          where: { id: resourceId },
          select: { authorId: true },
        });
        
        if (!post) return sendError(res, "Post não encontrado", 404);

        isOwner = post.authorId === req.user.id;
      } else if (resourceType === "user") isOwner = resourceId === req.user.id;

      if (!isOwner)
        return sendError(
          res,
          "Você não tem permissão para acessar este recurso",
          403,
        );

      next();
    } catch (error) {
      return sendError(res, "Erro ao verificar propriedade", 500, error);
    }
  };
};
