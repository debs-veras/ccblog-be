import { Router, type Router as ExpressRouter } from "express";
import { CategoryController } from "controller/category.controller";
import { authMiddleware } from "middleware/auth.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";

const categoryRouter: ExpressRouter = Router();
// Rotas públicas
categoryRouter.get("/", CategoryController.getAll);
// Rotas protegidas (apenas ADMIN)
categoryRouter.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  CategoryController.getById,
);
categoryRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  CategoryController.create,
);
categoryRouter.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  CategoryController.update,
);
categoryRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  CategoryController.delete,
);

export default categoryRouter;
