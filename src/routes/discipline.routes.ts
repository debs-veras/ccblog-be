import { DisciplineController } from "controller/discipline.controller";
import { Router } from "express";

import { authMiddleware } from "middleware/auth.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";

export const disciplineRouter = Router();

// Apenas professores ou admin podem criar/editar/deletar disciplinas
disciplineRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  DisciplineController.create,
);
disciplineRouter.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  DisciplineController.update,
);
disciplineRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  DisciplineController.delete,
);

disciplineRouter.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  DisciplineController.getById,
);

disciplineRouter.get("/", DisciplineController.list);
