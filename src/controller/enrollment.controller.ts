import { Request, Response, NextFunction } from "express";
import { EnrollmentService } from "service/enrollment.service";
import { createEnrollmentSchema } from "schemas/enrollment.schema";
import { sendSuccess } from "util/response";

export class EnrollmentController {
  static async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createEnrollmentSchema.parse(req.body);
      const enrollment = await EnrollmentService.enrollStudent(data);
      return sendSuccess(
        res,
        "Matrícula realizada com sucesso",
        enrollment,
        201,
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async listByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { period } = req.query;
      const enrollments = await EnrollmentService.listStudentEnrollments(
        studentId as string,
        period ? Number(period) : undefined,
      );

      return sendSuccess(
        res,
        "Matrículas recuperadas com sucesso",
        enrollments,
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const enrollment = await EnrollmentService.updateStatus(
        id as string,
        status,
      );
      return sendSuccess(res, "Matrícula atualizada com sucesso", enrollment);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await EnrollmentService.cancelEnrollment(id as string);
      return sendSuccess(res, "Matrícula removida com sucesso", null);
    } catch (error: any) {
      next(error);
    }
  }


}
