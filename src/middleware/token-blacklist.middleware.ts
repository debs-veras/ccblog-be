import { Request, Response, NextFunction } from "express";
import { sendError } from "../util/response";
/**
 * Blacklist de tokens (em memória)
*/
const tokenBlacklist = new Set<string>();
/**
 * Adiciona um token à blacklist
 */
export const blacklistToken = (token: string) => {
  tokenBlacklist.add(token);
};

/**
 * Verifica se um token está na blacklist
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

/**
 * Middleware para verificar se o token está na blacklist
 * Usar após authMiddleware
 */
export const checkTokenBlacklist = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const token = authHeader.split(" ")[1];
  if (!token) return next();
  if (isTokenBlacklisted(token))
    return sendError(res, "Token inválido. Faça login novamente", 401);
  next();
};
/**
 * Limpa tokens expirados da blacklist periodicamente
 * Access tokens expiram em 15 minutos
 */
setInterval(
  () => {
    // Como tokens expiram em 15min, podemos limpar a blacklist periodicamente
    tokenBlacklist.clear();
  },
  15 * 60 * 1000,
); // Limpar a cada 15 minutos
