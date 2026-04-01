import { prisma } from "lib/prisma";
import {
  CreateDisciplineInput,
  UpdateDisciplineInput,
} from "@schemas/discipline.schema";
import { DisciplineFilter } from "../models/discipline.model";
import { PaginatedResponse } from "models/post.model";

export class DisciplineRepository {
  static async create(data: CreateDisciplineInput) {
    const { prerequisiteIds, ...rest } = data;
    return prisma.discipline.create({
      data: {
        ...rest,
        schedules: { create: rest.schedules || [] },
        prerequisites: {
          create: prerequisiteIds?.map((id) => ({ prerequisiteId: id })) || [],
        },
      },
      include: {
        schedules: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        prerequisites: {
          include: {
            prerequisite: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  static async update(id: string, data: UpdateDisciplineInput) {
    const { schedules, prerequisiteIds, force, ...rest } = data;
    return prisma.discipline.update({
      where: { id },
      data: {
        ...rest,
        schedules: schedules
          ? {
              deleteMany: {},
              create: schedules,
            }
          : undefined,

        prerequisites: prerequisiteIds
          ? {
              deleteMany: {},
              create: prerequisiteIds.map((prerequisiteId) => ({
                prerequisiteId,
              })),
            }
          : undefined,
      },
      include: {
        schedules: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        prerequisites: {
          include: {
            prerequisite: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.discipline.findUnique({
      where: { id },
      include: {
        schedules: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        prerequisites: {
          include: {
            prerequisite: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  static async findMany(
    filters?: DisciplineFilter,
  ): Promise<PaginatedResponse<any>> {
    const isPaginated = !!(filters?.limit && filters.limit > 0);
    const page = isPaginated
      ? filters?.page && filters.page > 0
        ? filters.page
        : 1
      : 1;
    const limit = isPaginated ? Number(filters!.limit) : undefined;
    const skip = isPaginated ? (page - 1) * limit! : undefined;

    const where: any = {};
    const and: any[] = [];
    if (filters?.name)
      and.push({ name: { contains: filters.name, mode: "insensitive" } });
    if (filters?.code)
      and.push({ code: { contains: filters.code, mode: "insensitive" } });
    if (filters?.teacherId) and.push({ teacherId: filters.teacherId });
    if (filters?.period) and.push({ period: Number(filters.period) });
    if (and.length) where.AND = and;

    const [data, total] = await Promise.all([
      prisma.discipline.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          schedules: true,
          prerequisites: {
            include: {
              prerequisite: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.discipline.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
    };
  }

  static async delete(id: string) {
    return prisma.discipline.delete({ where: { id } });
  }
}
