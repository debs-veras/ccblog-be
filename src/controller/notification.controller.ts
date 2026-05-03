import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../util/response";
import { NotificationService } from "../service/notification.service";

export class NotificationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const page = Number(req.query.page || 1) || 1;
      const perPage = Number(req.query.perPage || req.query.limit || 20) || 20;

      const notifications = await NotificationService.getUserNotificationsPaginated(
        userId as string,
        page,
        perPage,
      );

      return sendSuccess(res, "Lista de notificações", notifications);
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;

      await NotificationService.markAsRead(
        userId as string,
        notificationId as string,
      );

      return sendSuccess(res, "Notificação marcada como lida");
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const result = await NotificationService.markAllAsRead(userId as string);
      return sendSuccess(res, "Todas notificações foram marcadas como lidas", {
        count: result.count,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;

      await NotificationService.deleteNotification(
        userId as string,
        notificationId as string,
      );

      return sendSuccess(res, "Notificação removida com sucesso");
    } catch (err) {
      next(err);
    }
  }
}
