import { AppError } from "errors/appError";
import { Request, Response, NextFunction } from "express";
import { sendError } from "util/response";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Erro capturado:", err);

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return sendError(res, "Erro de validação", 400, details);
  }

  if (err instanceof AppError)
    return sendError(res, err.message, err.statusCode, err.details);

  return sendError(res, (err as any)?.message, 500, {
    name: (err as any)?.name,
    message: (err as any)?.message,
    stack: (err as any)?.stack,
  });
};
