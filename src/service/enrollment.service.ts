import { CreateEnrollmentInput } from "schemas/enrollment.schema";
import { EnrollmentRepository } from "repositories/enrollment.repository";
import { DisciplineRepository } from "repositories/discipline.repository";
import { UserRepository } from "repositories/user.repository";
import { prisma } from "lib/prisma";

export class EnrollmentService {
  /**
   * Realiza a matrícula de um estudante em uma disciplina.
   * Valida:
   * 1. Existência do estudante e papel (STUDENT).
   * 2. Existência da disciplina.
   * 3. Se o estudante já passou nos pré-requisitos (status: PASSED).
   * 4. Se não há choque de horários no mesmo período.
   * 5. Se já não está matriculado na mesma disciplina/período.
   */
  static async enrollStudent(data: CreateEnrollmentInput) {
    // 1. Validar usuário
    const student = await UserRepository.findById(data.studentId);
    if (!student || student.role !== "STUDENT")
      throw {
        statusCode: 400,
        message:
          "Estudante não encontrado ou usuário não possui papel de estudante",
      };
    // 2. Validar disciplina
    const discipline = await DisciplineRepository.findById(data.disciplineId);
    if (!discipline)
      throw { statusCode: 400, message: "Disciplina não encontrada" };
    // 3. Verificar matrícula existente
    const existing = await EnrollmentRepository.findUnique(
      data.studentId,
      data.disciplineId,
      data.period,
    );

    if (existing) {
      if (existing.status === "PASSED") {
        throw {
          statusCode: 400,
          message: "Disciplina já foi concluída",
        };
      }

      if (existing.status === "ENROLLED") {
        throw {
          statusCode: 400,
          message:
            "Estudante já está matriculado nesta disciplina para este período",
        };
      }
    }

    // 4. Validar pré-requisitos
    if (discipline.prerequisites && discipline.prerequisites.length > 0) {
      const allEnrollments = await EnrollmentRepository.findByStudentId(
        data.studentId,
      );

      const passedDisciplinesIds = allEnrollments
        .filter((e) => e.status === "PASSED")
        .map((e) => e.disciplineId);

      for (const pre of discipline.prerequisites) {
        if (!passedDisciplinesIds.includes(pre.prerequisiteId)) {
          throw new Error(
            `Estudante não possui o pré-requisito: ${pre.prerequisite.name} (${pre.prerequisite.code})`,
          );
        }
      }
    }

    // 5. Validar choque de horários
    const currentEnrollments = await EnrollmentRepository.findByStudentId(
      data.studentId,
      data.period,
    );

    const activeEnrollments = currentEnrollments.filter(
      (e) => e.status === "ENROLLED",
    );

    for (const enrollment of activeEnrollments) {
      for (const currentSched of enrollment.discipline.schedules) {
        for (const targetSched of discipline.schedules) {
          const isSameDay = currentSched.dayOfWeek === targetSched.dayOfWeek;

          const isOverlapping =
            currentSched.startTime < targetSched.endTime &&
            targetSched.startTime < currentSched.endTime;

          if (isSameDay && isOverlapping)
            throw {
              statusCode: 400,
              message: `Choque de horário com a disciplina já matriculada: ${enrollment.discipline.name}`,
            };
        }
      }
    }
    return EnrollmentRepository.create(data);
  }

  static async listStudentEnrollments(studentId: string, period?: number) {
    return EnrollmentRepository.findByStudentId(studentId, period);
  }

  static async canRemoveEnrollment(enrollmentId: string) {
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment)
      throw { statusCode: 400, message: "Matrícula não encontrada" };

    const studentId = enrollment.studentId;
    const disciplineId = enrollment.disciplineId;
    const allEnrollments = await EnrollmentRepository.findByStudentId(studentId);

    for (const e of allEnrollments) {
      if (e.disciplineId === disciplineId) continue;
      const prerequisites = e.discipline.prerequisites || [];
      const isRequired = prerequisites.some(
        (p) => p.prerequisiteId === disciplineId,
      );

      if (isRequired && (e.status === "ENROLLED" || e.status === "PASSED")) {
        const statusLabel =
          e.status === "ENROLLED" ? "em andamento" : "já concluída";
        throw {
          statusCode: 400,
          message: `Não pode remover "${enrollment.discipline.name}". Ela é pré-requisito de "${e.discipline.name}" (${statusLabel}).`,
        };
      }
    }

    return true;
  }

  static async cancelEnrollment(id: string) {
    const enrollment = await EnrollmentRepository.findById(id);
    if (!enrollment) throw new Error("Matrícula não encontrada");
    await this.canRemoveEnrollment(id);
    return EnrollmentRepository.delete(id);
  }

  static async updateStatus(id: string, status: any) {
    return EnrollmentRepository.updateStatus(id, status);
  }
}
