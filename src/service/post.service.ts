import { PostFilter } from "../models/post.model";
import { PostRepository } from "../repositories/post.repository";
import {
  RegisterPostInput,
  registerPostSchema,
  UpdatePostInput,
  updatePostSchema,
} from "../schemas/post.schema";
import { NotificationService } from "./notification.service";

export class PostService {
  static async getAllPosts(filters?: PostFilter) {
    return PostRepository.getAll(filters);
  }

  static async getPostById(id?: string) {
    if (!id) throw { statusCode: 400, message: "ID inválido", details: { id } };
    const post = await PostRepository.findById(id);
    if (!post) throw { statusCode: 404, message: "Post não encontrado" };
    return post;
  }

  static async getPostBySlug(slug?: string) {
    if (!slug) {
      throw {
        statusCode: 400,
        message: "Slug inválido",
        details: { slug },
      };
    }
    const post = await PostRepository.findBySlug(slug);
    if (!post) throw { statusCode: 404, message: "Post não encontrado" };

    if (!post.published)
      throw { statusCode: 404, message: "Post não encontrado" };

    return PostRepository.incrementViews(post.id);
  }

  static async getPostsByAuthor(authorId?: string, filters?: PostFilter) {
    if (!authorId) {
      throw {
        statusCode: 400,
        message: "ID do autor inválido",
        details: { authorId },
      };
    }
    return PostRepository.findByAuthorId(authorId, filters);
  }

  static async createPost(
    data: RegisterPostInput,
    authorId: string | undefined,
  ) {
    if (!authorId)
      throw { statusCode: 401, message: "Usuário não autenticado" };
    // Valida usando schema
    const parsed = registerPostSchema.parse(data);
    const existingPost = await PostRepository.findBySlug(parsed.slug);

    if (existingPost) throw { statusCode: 400, message: "Slug já existe" };

    const postData = {
      ...parsed,
      authorId,
      categoryId: parsed.categoryId || undefined,
    };

    const newPost = await PostRepository.create(postData);
    return newPost;
  }

  static async updatePost(id: string, rawData: UpdatePostInput) {
    if (!id) throw { statusCode: 400, message: "ID inválido", details: { id } };

    const post = await PostRepository.findById(id);
    if (!post) throw { statusCode: 404, message: "Post não encontrado" };

    const validatedData = updatePostSchema.parse(rawData);

    if (validatedData.slug && validatedData.slug !== post.slug) {
      const existingPost = await PostRepository.findBySlug(validatedData.slug);
      if (existingPost) throw { statusCode: 400, message: "Slug já existe" };
    }

    const updatedPost = await PostRepository.update(id, validatedData);
    return updatedPost;
  }

  static async deletePost(id?: string) {
    if (!id)
      throw {
        statusCode: 400,
        message: "ID inválido",
        details: { id },
      };

    const post = await PostRepository.findById(id);
    if (!post) throw { statusCode: 404, message: "Post não encontrado" };

    return PostRepository.delete(id);
  }

  static async publishPost(id?: string) {
    if (!id) throw { statusCode: 400, message: "ID inválido", details: { id } };

    const post = await PostRepository.findById(id);
    if (!post) throw { statusCode: 404, message: "Post não encontrado" };

    const nextPublished = !post.published;

    const updatedPost = await PostRepository.update(id, {
      published: nextPublished,
    });

    if (!post.published && nextPublished)
      await NotificationService.notifyNewPost(updatedPost);
    
    return { post: updatedPost, published: nextPublished };
  }

  static async incrementViews(id: string) {
    return PostRepository.incrementViews(id);
  }
}
