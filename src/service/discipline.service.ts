import {
  CreateDisciplineInput,
  UpdateDisciplineInput,
} from "@schemas/discipline.schema";
import { DisciplineFilter } from "models/discipline.model";
import { DisciplineRepository } from "repositories/discipline.repository";
import { UserRepository } from "repositories/user.repository";
import { EnrollmentRepository } from "repositories/enrollment.repository";
import { EnrollmentStatus } from "../generated/prisma/enums";

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
          throw {
            statusCode: 400,
            message: "Há horários sobrepostos enviados.",
          };
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
      if (invalid) throw new Error("Algum pré-requisito informado não existe");
    }

    if (data.teacherId) {
      const teacher = await UserRepository.findById(data.teacherId);
      if (!teacher || teacher.role !== "TEACHER")
        throw new Error("ID do professor inválido ou usuário não é professor");

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
                throw {
                  statusCode: 400,
                  message: `Choque de horário com a disciplina: ${disc.name}`,
                };
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

    const discipline = await DisciplineRepository.findById(id);
    if (!discipline) throw new Error("Disciplina não encontrada");

    // Validação do professor
    if (data.teacherId) {
      const teacher = await UserRepository.findById(data.teacherId);
      if (!teacher || teacher.role !== "TEACHER")
        throw new Error("ID do professor inválido ou usuário não é professor");
    }

    // Validação de pré-requisitos
    if (data.prerequisiteIds) {
      if (data.prerequisiteIds.includes(id))
        throw new Error("Uma disciplina não pode ser pré-requisito dela mesma");

      if (data.prerequisiteIds.length > 0) {
        const prereqs = await Promise.all(
          data.prerequisiteIds.map((prereqId) =>
            DisciplineRepository.findById(prereqId),
          ),
        );

        if (prereqs.some((d) => !d)) {
          throw new Error("Algum pré-requisito informado não existe");
        }
      }
    }

    // Validação de horários
    if (data.schedules && data.schedules.length > 0) {
      const teacherId = data.teacherId ?? discipline.teacherId;

      if (teacherId) {
        const existingDisciplines = await DisciplineRepository.findMany({
          teacherId,
        });

        for (const sched of data.schedules) {
          for (const disc of existingDisciplines.data.filter(
            (d) => d.id !== id,
          )) {
            for (const existingSched of disc.schedules) {
              const hasConflict =
                sched.dayOfWeek === existingSched.dayOfWeek &&
                sched.startTime < existingSched.endTime &&
                existingSched.startTime < sched.endTime;

              if (hasConflict) {
                throw new Error(
                  `Choque de horário com a disciplina: ${disc.name}`,
                );
              }
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
          (e) => e.disciplineId !== id && e.status === EnrollmentStatus.ENROLLED,
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

      if (conflicts.length > 0 && !data.force) {
        throw {
          statusCode: 400,
          message: `A alteração de horário causará conflitos para ${
            conflicts.length === 1 ? "1 aluno" : `${conflicts.length} alunos`
          }:`,
          details: conflicts,
        };
      }
    }

    return DisciplineRepository.update(id, data);
  }

  static async getDiscipline(id: string) {
    return DisciplineRepository.findById(id);
  }

  static async listDisciplines(filters?: DisciplineFilter) {
    return DisciplineRepository.findMany(filters);
  }

  static async deleteDiscipline(id: string) {
    return DisciplineRepository.delete(id);
  }
}
