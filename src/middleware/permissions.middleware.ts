import { Request, Response, NextFunction } from "express";
import { sendError } from "../util/response";
import { UserRole } from "../models/user.model";

/**
 * Middleware para verificar roles permitidas
 */

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, "Usuário não autenticado", 401);
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Você não tem permissão para executar esta ação",
        403,
      );
    }
    next();
  };
};
