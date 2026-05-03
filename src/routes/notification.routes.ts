import { Router } from "express";
import { NotificationController } from "controller/notification.controller";
import { authMiddleware } from "middleware/auth.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";

const notificationRouter = Router();
notificationRouter.use(authMiddleware);

notificationRouter.get(
  "/",
  roleMiddleware(["STUDENT"]),
  NotificationController.getAll,
);
notificationRouter.patch(
  "/read-all",
  roleMiddleware(["STUDENT"]),
  NotificationController.markAllAsRead,
);
notificationRouter.patch(
  "/:id/read",
  roleMiddleware(["STUDENT"]),
  NotificationController.markAsRead,
);
notificationRouter.delete(
  "/:id",
  roleMiddleware(["STUDENT"]),
  NotificationController.delete,
);

export default notificationRouter;
