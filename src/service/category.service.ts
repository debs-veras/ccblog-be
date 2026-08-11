import { AppError } from "errors/appError";
import { CategoryRepository } from "../repositories/category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";

export class CategoryService {
  private static categoryRepository = new CategoryRepository();

  static async getAllCategories() {
    return this.categoryRepository.findAll();
  }

  static async getCategoryById(id?: string) {
    if (!id) throw new AppError("Id não encontrado", 404);
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError("Categoria não encontrada", 404);
    return category;
  }

  static async createCategory(data: CreateCategoryInput) {
    const nameExists = await this.categoryRepository.checkNameExists(data.name);
    if (nameExists) throw new AppError("Já existe uma categoria com este nome", 409);
    const slugExists = await this.categoryRepository.checkSlugExists(data.slug);
    if (slugExists) throw new AppError("Já existe uma categoria com este slug", 409);
    return this.categoryRepository.create(data);
  }

  static async updateCategory(id: string, data: UpdateCategoryInput) {
    await this.getCategoryById(id);

    if (data.name) {
      const nameExists = await this.categoryRepository.checkNameExists(data.name, id);
      if (nameExists) throw new AppError("Já existe uma categoria com este nome", 409);
    }

    if (data.slug) {
      const slugExists = await this.categoryRepository.checkSlugExists(data.slug, id);
      if (slugExists) throw new AppError("Já existe uma categoria com este slug", 409);
    }

    return this.categoryRepository.update(id, data);
  }

  static async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);
    if (category._count && category._count.posts > 0) 
      throw new AppError("Não é possível excluir uma categoria que possui posts associados", 400);

    return this.categoryRepository.delete(id);
  }
}
