import { prisma } from "../lib/prisma";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema";

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  async checkNameExists(name: string, excludeId?: string) {
    const where: any = { name };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const category = await prisma.category.findFirst({ where });
    return !!category;
  }

  async checkSlugExists(slug: string, excludeId?: string) {
    const where: any = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const category = await prisma.category.findFirst({ where });
    return !!category;
  }
}
