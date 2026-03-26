import { Request, Response, NextFunction } from "express";
import { DashboardService } from "service/dashboard.service";
import { sendSuccess } from "util/response";

export class DashboardController {
  static async getStudentDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const data = await DashboardService.getStudentDashboard(userId as string);
      return sendSuccess(res, "Dashboard recuperado com sucesso", data);
    } catch (error: any) {
      next(error);
    }
  }

  static async getTeacherDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const data = await DashboardService.getTeacherDashboard(userId as string);
      return sendSuccess(res, "Dashboard do professor recuperado com sucesso", data);
    } catch (error: any) {
      next(error);
    }
  }
}
