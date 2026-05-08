import { prisma } from "lib/prisma";
import { PostFilter, PaginatedResponse } from "../models/post.model";
import { RegisterPostInput, UpdatePostInput } from "@schemas/post.schema";

export class PostRepository {
  // Listar todos os posts (com filtros opcionais)
  static async getAll(filters?: PostFilter): Promise<PaginatedResponse<any>> {
    const where: any = {};
    const and: any[] = [];

    if (filters?.title)
      and.push({ title: { contains: filters.title, mode: "insensitive" } });
    if (filters?.published !== undefined) {
      const published =
        typeof filters.published === "string"
          ? filters.published === "true"
          : filters.published;

      and.push({ published });
    }
    if (filters?.author)
      and.push({
        author: { name: { contains: filters.author, mode: "insensitive" } },
      });
    if (filters?.authorId) and.push({ authorId: filters.authorId });
    if (filters?.categoryId) and.push({ categoryId: filters.categoryId });
    if (filters?.startDate || filters?.endDate) {
      const createdAt: { gte?: Date; lte?: Date } = {};
      if (filters?.startDate) {
        const start = new Date(filters.startDate);
        if (!Number.isNaN(start.getTime())) createdAt.gte = start;
      }
      if (filters?.endDate) {
        const end = new Date(filters.endDate);
        if (!Number.isNaN(end.getTime())) createdAt.lte = end;
      }
      if (Object.keys(createdAt).length) and.push({ createdAt });
    }
    if (and.length) where.AND = and;

    const isPaginated = !!(filters?.limit && filters.limit > 0);
    const page = isPaginated
      ? filters?.page && filters.page > 0
        ? filters.page
        : 1
      : 1;
    const limit = isPaginated ? Number(filters!.limit) : undefined;
    const skip = isPaginated ? (page - 1) * limit! : undefined;

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
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

  // Buscar post por ID
  static async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
  }

  // Buscar post pela url
  static async findBySlug(slug: string) {
    return prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
  }

  // Buscar post por autor
  static async findByAuthorId(
    authorId: string,
    filters?: PostFilter,
  ): Promise<PaginatedResponse<any>> {
    return this.getAll({ ...filters, authorId });
  }

  static async create(data: RegisterPostInput) {
    return prisma.post.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        slug: data.slug,
        published: false,
        author: { connect: { id: data.authorId } },
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
  }

  static async update(id: string, data: UpdatePostInput) {
    return prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.post.delete({ where: { id } });
  }

  static async incrementViews(id: string) {
    return prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
  }
}
