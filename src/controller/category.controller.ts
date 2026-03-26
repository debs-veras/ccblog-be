import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../service/category.service";
import { sendSuccess } from "../util/response";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";

export class CategoryController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAllCategories();
      return sendSuccess(res, "Categorias recuperadas com sucesso", categories);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id as string);
      return sendSuccess(res, "Categoria recuperada com sucesso", category);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await CategoryService.createCategory(validatedData);
      return sendSuccess(res, "Categoria criada com sucesso", category, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        return next({
          statusCode: 400,
          message: "ID inválido",
          details: { id },
        });
      }
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await CategoryService.updateCategory(id, validatedData);
      return sendSuccess(res, "Categoria atualizada com sucesso", category);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        return next({
          statusCode: 400,
          message: "ID inválido",
          details: { id },
        });
      }
      await CategoryService.deleteCategory(id);
      return sendSuccess(res, "Categoria excluída com sucesso");
    } catch (err) {
      next(err);
    }
  }
}
