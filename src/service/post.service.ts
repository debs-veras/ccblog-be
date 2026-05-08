import { AppError } from "errors/appError";
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
    if (!id) throw new AppError("ID inválido", 400, { id });
    const post = await PostRepository.findById(id);
    if (!post) throw new AppError("Post não encontrado", 404);
    return post;
  }

  static async getPostBySlug(slug?: string) {
    if (!slug) throw new AppError("Slug inválido", 400, { slug });
    const post = await PostRepository.findBySlug(slug);
    if (!post) throw new AppError("Post não encontrado", 404);
    if (!post.published) throw new AppError("Post não encontrado", 404);
    return PostRepository.incrementViews(post.id);
  }

  static async getPostsByAuthor(authorId?: string, filters?: PostFilter) {
    if (!authorId)
      throw new AppError("ID do autor inválido", 400, { authorId });
    return PostRepository.findByAuthorId(authorId, filters);
  }

  static async createPost(data: RegisterPostInput) {
    const authorId = data.authorId;
    const parsed = registerPostSchema.parse(data);
    const existingPost = await PostRepository.findBySlug(parsed.slug);
    if (existingPost)
      throw new AppError("Slug já existe", 400, { slug: parsed.slug });

    const postData = {
      ...parsed,
      authorId,
      categoryId: parsed.categoryId,
    };

    const newPost = await PostRepository.create(postData);
    return newPost;
  }

  static async updatePost(rawData: UpdatePostInput) {
    const { id } = rawData;
    if (!id) throw new AppError("ID inválido", 400, { id });
    const post = await PostRepository.findById(id);
    if (!post) throw new AppError("Post não encontrado", 404);
    const validatedData = updatePostSchema.parse(rawData);
    if (validatedData.slug && validatedData.slug !== post.slug) {
      const existingPost = await PostRepository.findBySlug(validatedData.slug);
      if (existingPost) throw new AppError("Slug já existe", 400);
    }
    const updatedPost = await PostRepository.update(validatedData);
    return updatedPost;
  }

  static async deletePost(id?: string) {
    if (!id) throw new AppError("ID inválido", 400, { id });
    const post = await PostRepository.findById(id);
    if (!post) throw new AppError("Post não encontrado", 404);
    return PostRepository.delete(id);
  }

  static async publishPost(id?: string) {
    if (!id) throw new AppError("ID inválido", 400, { id });
    const post = await PostRepository.findById(id);
    if (!post) throw new AppError("Post não encontrado", 404);
    const nextPublished = !post.published;
    const updatedPost = await PostRepository.update({
      id,
      published: nextPublished,
    });

    if (!post.published && nextPublished)
      await NotificationService.notifyNewPost(updatedPost);
    return { post: updatedPost, published: nextPublished };
  }

  static async incrementViews(id: string) {
    if (!id) throw new AppError("ID inválido", 400, { id });
    return PostRepository.incrementViews(id);
  }
}
