import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../util/response";
import { PostService } from "../service/post.service";
export class PostController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const result = await PostService.getAllPosts(filters);
      return sendSuccess(res, "Lista de posts", result);
    } catch (err) {
      next(err);
    }
  }

  static async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const result = await PostService.getAllPosts({
        ...filters,
        published: true,
      });
      return sendSuccess(res, "Lista de posts publicados", result);
    } catch (err) {
      next(err);
    }
  }

  static async getByAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorId } = req.params;
      const filters = req.query;

      const posts = await PostService.getPostsByAuthor(
        authorId as string,
        filters,
      );
      return sendSuccess(res, "Posts do autor", posts);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await PostService.getPostById(id as string);
      return sendSuccess(res, "Post encontrado", post);
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const post = await PostService.getPostBySlug(slug as string);
      return sendSuccess(res, "Post encontrado", post);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = req.user?.id as string;
      const post = await PostService.createPost({ ...req.body, authorId });
      return sendSuccess(res, "Post criado com sucesso", post, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await PostService.updatePost({ ...req.body, id: req.params.id });
      return sendSuccess(res, "Post atualizado com sucesso", post);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await PostService.deletePost(id as string);
      return sendSuccess(res, "Post deletado com sucesso", null);
    } catch (err) {
      next(err);
    }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PostService.publishPost(id as string);
      const message = result.published
        ? "Post publicado com sucesso"
        : "Post despublicado com sucesso";
      return sendSuccess(res, message, result.post);
    } catch (err) {
      next(err);
    }
  }
}
