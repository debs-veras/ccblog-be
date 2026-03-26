import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/constants";
import { sendError } from "../util/response";
import { UserRole } from "../models/user.model";
import { isTokenBlacklisted } from "./token-blacklist.middleware";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return sendError(res, "Token não fornecido", 401);

  const token = authHeader.split(" ")[1];
  if (!token) return sendError(res, "Token inválido", 401);

  // Verifica se o token está na blacklist (foi feito logout)
  if (isTokenBlacklisted(token))
    return sendError(
      res,
      "Token inválido. Faça login novamente",
      401,
    );

  if (!JWT_SECRET)
    return sendError(res, "Erro interno do servidor", 500);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: UserRole;
      name?: string;
      email?: string;
    };
    req.user = decoded;
    next();
  } catch {
    return sendError(res, "Token inválido", 401);
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole; name?: string; email?: string };
    }
  }
}
