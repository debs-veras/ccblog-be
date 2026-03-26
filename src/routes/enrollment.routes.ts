import { EnrollmentController } from "controller/enrollment.controller";
import { Router } from "express";
import { authMiddleware } from "middleware/auth.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";

export const enrollmentRouter = Router();

// Matricular estudante (apenas o próprio estudante ou ADMIN)
enrollmentRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "STUDENT"]),
  EnrollmentController.enroll,
);

// Listar matrículas de um estudante (próprio ou ADMIN)
enrollmentRouter.get(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware(["ADMIN", "STUDENT"]),
  // ownershipMiddleware("user"),
  EnrollmentController.listByStudent,
);

// Atualizar status (apenas ADMIN ou TEACHER se for professor da disciplina, mas simplificando para ADMIN por enquanto)
enrollmentRouter.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "STUDENT"]),
  EnrollmentController.updateStatus,
);

// Trancar/Remover matrícula (apenas o estudante ou ADMIN)
enrollmentRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "STUDENT"]),
  EnrollmentController.delete,
);


