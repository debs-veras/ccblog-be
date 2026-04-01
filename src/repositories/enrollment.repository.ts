import { prisma } from "lib/prisma";
import { CreateEnrollmentInput } from "schemas/enrollment.schema";
import { EnrollmentStatus } from "../generated/prisma/enums";

export class EnrollmentRepository {
  static async create(data: CreateEnrollmentInput) {
    return prisma.enrollment.create({
      data,
      include: {
        discipline: {
          include: {
            schedules: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.enrollment.findUnique({
      where: { id },
      include: {
        discipline: {
          include: {
            schedules: true,
            prerequisites: {
              include: {
                prerequisite: true,
              },
            },
          },
        },
      },
    });
  }

  static async findByStudentId(studentId: string, period?: number) {
    return prisma.enrollment.findMany({
      where: {
        studentId,
        period: period ? period : undefined,
      },
      include: {
        discipline: {
          include: {
            schedules: true,
            prerequisites: {
              include: {
                prerequisite: true,
              },
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async findUnique(
    studentId: string,
    disciplineId: string,
    period: number,
  ) {
    return prisma.enrollment.findUnique({
      where: {
        studentId_disciplineId_period: {
          studentId,
          disciplineId,
          period,
        },
      },
    });
  }

  static async updateStatus(id: string, status: any) {
    return prisma.enrollment.update({
      where: { id },
      data: { status },
    });
  }

  static async delete(id: string) {
    return prisma.enrollment.delete({
      where: { id },
    });
  }

  static async getStudentEnrollments(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        discipline: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            schedules: true,
          },
        },
      },
    });
  }

  static async findByDisciplineId(disciplineId: string, status?: EnrollmentStatus) {
    return prisma.enrollment.findMany({
      where: {
        disciplineId,
        status,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
