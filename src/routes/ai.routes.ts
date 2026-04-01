import { Router, type Router as ExpressRouter } from "express";
import { AIController } from "../controller/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/permissions.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const aiRouter: ExpressRouter = Router();

// Sugestão de metadados para postagens (ADMIN, TEACHER e STUDENT que criam posts)
aiRouter.post(
  "/suggest-metadata",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER", "STUDENT"]),
  rateLimitMiddleware(10, 60 * 60 * 1000), // Limite de 10 requisições por hora para evitar spam de tokens
  AIController.suggestMetadata
);

// Chat Acadêmico (Aberto para todos os usuários logados)
aiRouter.post(
  "/academic-chat",
  authMiddleware,
  rateLimitMiddleware(50, 60 * 60 * 1000), // Limite de 50 perguntas por hora
  AIController.academicChat
);

export default aiRouter;
