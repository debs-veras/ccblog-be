import { PostController } from "controller/post.controller";
import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "middleware/auth.middleware";
import { ownershipMiddleware } from "middleware/ownership.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";
// import { auditMiddleware } from "middleware/audit.middleware";
import { rateLimitMiddleware } from "middleware/rate-limit.middleware";

const postRouter: ExpressRouter = Router();
// Rotas públicas
// Rota para obter posts publicados
postRouter.get("/published", PostController.getPublished);
postRouter.get("/slug/:slug", PostController.getBySlug);

// Rota para obter post por ID (apenas ADMIN ou AUTHOR dono do post)
postRouter.get(
  "/by-id/:id",
  authMiddleware,
  ownershipMiddleware("post"),
  roleMiddleware(["ADMIN", "TEACHER" , "STUDENT"]),
  PostController.getById,
);
// Rota para obter todos os posts (apenas ADMIN)
postRouter.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  PostController.getAll,
);
// Rota para obter posts por autor
postRouter.get(
  "/author/:authorId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER", "STUDENT"]),
  PostController.getByAuthor,
);
// Criar posts (apenas AUTHOR e ADMIN) com rate limit
postRouter.post(
  "/",
  rateLimitMiddleware(20, 60 * 60 * 1000),
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER", 'STUDENT']),
  // auditMiddleware("create", "post"),
  PostController.create,
);
// Atualizar posts (próprios ou todos se ADMIN)
postRouter.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER", 'STUDENT']),
  ownershipMiddleware("post"),
  // auditMiddleware("update", "post"),
  PostController.update,
);
// Deletar posts (próprios ou todos se ADMIN)
postRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER", 'STUDENT']),
  ownershipMiddleware("post"),
  // auditMiddleware("delete", "post"),
  PostController.delete,
);
// Publicar post (próprios ou todos se ADMIN)
postRouter.patch(
  "/:id/publish",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  ownershipMiddleware("post"),
  // auditMiddleware("publish", "post"),
  PostController.publish,
);

export default postRouter;
