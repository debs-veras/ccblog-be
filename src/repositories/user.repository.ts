import { RegisterUserInput, UpdateUserInput } from "@schemas/user.shema";
import { prisma } from "lib/prisma";
import { PaginatedResponse } from "models/post.model";
import { UserFilter } from "models/user.model";

export class UserRepository {
  static async getAll(filters?: UserFilter): Promise<PaginatedResponse<any>> {
    const where: any = {};
    const and: any[] = [];
    if (filters?.name)
      and.push({
        name: { contains: filters.name, mode: "insensitive" },
      });

    if (filters?.email)
      and.push({
        email: { contains: filters.email, mode: "insensitive" },
      });

    if (filters?.role)
      and.push({
        role: filters.role,
      });

    if (and.length) where.AND = and;
    const isPaginated = !!(filters?.limit && filters.limit > 0);
    const page = isPaginated ? (filters?.page && filters.page > 0 ? filters.page : 1) : 1;
    const limit = isPaginated ? Number(filters!.limit) : undefined;
    const skip = isPaginated ? (page - 1) * limit! : undefined;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        omit: {
          password: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
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

  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });
  }

  static async create(userData: RegisterUserInput) {
    return prisma.user.create({ data: userData, omit: { password: true } });
  }

  static async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id }, omit: { password: true } });
  }

  static async updatePassword(userId: string, password: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password },
      omit: { password: true },
    });
  }

  static async countPostsByUser(userId: string) {
    return prisma.post.count({
      where: { authorId: userId },
    });
  }

  static async countDisciplinesByTeacher(userId: string) {
    return prisma.discipline.count({
      where: { teacherId: userId },
    });
  }
}
