import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../util/response";

interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Log do erro para debug
  console.error("Erro capturado:", err);

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return sendError(res, "Erro de validação", 400, details);
  }

  const appError = err as AppError;
  if (appError?.statusCode && appError?.message) {
    const details = isProduction ? undefined : appError.details;
    return sendError(res, appError.message, appError.statusCode, details);
  }

  const message = isProduction
    ? "Erro interno do servidor"
    : (err as any)?.message || "Erro interno do servidor";

  // Extrai apenas informações serializáveis do erro
  const details = isProduction
    ? undefined
    : {
        message: (err as any)?.message,
        name: (err as any)?.name,
        stack: (err as any)?.stack,
      };

  return sendError(res, message, 500, details);
};
