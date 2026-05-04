import {
  CreateDisciplineInput,
  UpdateDisciplineInput,
} from "@schemas/discipline.schema";
import { DisciplineFilter } from "models/discipline.model";
import { DisciplineRepository } from "repositories/discipline.repository";
import { UserRepository } from "repositories/user.repository";
import { EnrollmentRepository } from "repositories/enrollment.repository";
import { EnrollmentStatus } from "../generated/prisma/enums";
import { AppError } from "errors/appError";
import { ErrorCodes } from "errors/errorCodes";

export class DisciplineService {
  private static validateInternalSchedules(
    schedules: { dayOfWeek: number; startTime: string; endTime: string }[],
  ) {
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const sched1 = schedules[i];
        const sched2 = schedules[j];
        if (
          sched1.dayOfWeek === sched2.dayOfWeek &&
          sched1.startTime < sched2.endTime &&
          sched2.startTime < sched1.endTime
        ) {
          throw new AppError(ErrorCodes.SCHEDULE_CONFLICT, 400);
        }
      }
    }
  }

  static async createDiscipline(data: CreateDisciplineInput) {
    if (data.schedules) this.validateInternalSchedules(data.schedules);
    if (data.prerequisiteIds && data.prerequisiteIds.length > 0) {
      const prereqs = await Promise.all(
        data.prerequisiteIds.map((id) => DisciplineRepository.findById(id)),
      );
      const invalid = prereqs.some((d) => !d);
      if (invalid) throw new AppError(ErrorCodes.DISCIPLINE_NOT_FOUND, 404);
    }

    if (data.teacherId) {
      const teacher = await UserRepository.findById(data.teacherId);
      if (!teacher || teacher.role !== "TEACHER")
        throw new AppError(ErrorCodes.INVALID_TEACHER, 400);

      const existingDisciplines = await DisciplineRepository.findMany({
        teacherId: data.teacherId,
      });

      if (data.schedules) {
        for (const sched of data.schedules) {
          for (const disc of existingDisciplines.data) {
            for (const existingSched of disc.schedules) {
              if (
                sched.dayOfWeek === existingSched.dayOfWeek &&
                sched.startTime < existingSched.endTime &&
                existingSched.startTime < sched.endTime
              ) {
                throw new AppError(ErrorCodes.SCHEDULE_TEACHER_CONFLICT, 400);
              }
            }
          }
        }
      }
    }
    return DisciplineRepository.create(data);
  }

  static async updateDiscipline(id: string, data: UpdateDisciplineInput) {
    if (data.schedules) this.validateInternalSchedules(data.schedules);

    // Valida se a disciplina existe
    const discipline = await DisciplineRepository.findById(id);
    if (!discipline) throw new AppError(ErrorCodes.DISCIPLINE_NOT_FOUND, 400);

    // Valida se o professor existe
    if (data.teacherId) {
      const teacher = await UserRepository.findById(data.teacherId);
      if (!teacher || teacher.role !== "TEACHER")
        throw new AppError(ErrorCodes.INVALID_TEACHER, 400);
    }

    // Validação de pré-requisitos
    if (data.prerequisiteIds) {
      if (data.prerequisiteIds.includes(id))
        throw new AppError(ErrorCodes.PREREQUISITE_SELF, 400);

      if (data.prerequisiteIds.length > 0) {
        const prereqs = await Promise.all(
          data.prerequisiteIds.map((prereqId) =>
            DisciplineRepository.findById(prereqId),
          ),
        );

        if (prereqs.some((d) => !d))
          throw new AppError(ErrorCodes.PREREQUISITE_NOT_FOUND, 400);
      }
    }

    if (data.schedules && data.schedules.length > 0) {
      // Validação de horários com o professor
      const teacherId = data.teacherId;
      if (teacherId) {
        const existingDisciplines = await DisciplineRepository.findMany({
          teacherId,
        });
        for (const sched of data.schedules) {
          for (const disc of existingDisciplines.data.filter(
            (d) => d.id !== id,
          )) {
            for (const existingSched of disc.schedules) {
              if (
                sched.dayOfWeek === existingSched.dayOfWeek &&
                sched.startTime < existingSched.endTime &&
                existingSched.startTime < sched.endTime
              )
                throw new AppError(ErrorCodes.SCHEDULE_TEACHER_CONFLICT, 400);
            }
          }
        }
      }

      // Validação de choque para alunos matriculados
      const enrollments = await EnrollmentRepository.findByDisciplineId(
        id,
        EnrollmentStatus.ENROLLED,
      );
      const conflicts: string[] = [];

      for (const enrollment of enrollments) {
        const studentEnrollments = await EnrollmentRepository.findByStudentId(
          enrollment.studentId,
          enrollment.period,
        );

        const otherEnrollments = studentEnrollments.filter(
          (e) =>
            e.disciplineId !== id && e.status === EnrollmentStatus.ENROLLED,
        );

        for (const other of otherEnrollments) {
          for (const newSched of data.schedules) {
            for (const existingSched of other.discipline.schedules) {
              const hasConflict =
                newSched.dayOfWeek === existingSched.dayOfWeek &&
                newSched.startTime < existingSched.endTime &&
                existingSched.startTime < newSched.endTime;

              if (hasConflict) {
                conflicts.push(
                  `Aluno: ${enrollment.student.name} - Conflito com ${other.discipline.name}`,
                );
              }
            }
          }
        }
      }

      if (conflicts.length > 0 && !data.force)
        throw new AppError(ErrorCodes.STUDENT_CONFLICT, 400, {
          details: conflicts,
        });
    }

    return DisciplineRepository.update(id, data);
  }

  static async getDiscipline(id: string) {
    const discipline = await DisciplineRepository.findById(id);
    if (!discipline) throw new AppError(ErrorCodes.DISCIPLINE_NOT_FOUND, 404);
    return discipline;
  }

  static async listDisciplines(filters?: DisciplineFilter) {
    return DisciplineRepository.findMany(filters);
  }

  static async deleteDiscipline(id: string) {
    return DisciplineRepository.delete(id);
  }
}
