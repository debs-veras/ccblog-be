import { DashboardController } from "controller/dashboard.controller";
import { Router } from "express";
import { authMiddleware } from "middleware/auth.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";

export const dashboardRouter = Router();

// /dashboard/student
dashboardRouter.get(
  "/student",
  authMiddleware,
  roleMiddleware(["ADMIN", "STUDENT"]),
  DashboardController.getStudentDashboard,
);

// /dashboard/teacher
dashboardRouter.get(
  "/teacher",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  DashboardController.getTeacherDashboard,
);
