import { Request, Response, NextFunction } from "express";
import { sendError } from "../util/response";

/**
 * Rate limiting simples baseado em memória
 * Para produção, considere usar Redis
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Limpa entradas expiradas periodicamente
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Limpar a cada minuto

/**
 * Middleware de rate limiting
 * @param maxRequests - Número máximo de requisições
 * @param windowMs - Janela de tempo em milissegundos
 */
export const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 minutos
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip || "unknown";
    const key = `${identifier}:${req.path}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      const resetIn = Math.ceil((store[key].resetTime - now) / 1000);
      return sendError(
        res,
        `Limite de requisições excedido. Tente novamente em ${resetIn} segundos`,
        429,
      );
    }

    next();
  };
};
