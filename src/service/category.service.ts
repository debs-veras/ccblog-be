import { CategoryRepository } from "../repositories/category.repository";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema";

export class CategoryService {
  private static categoryRepository = new CategoryRepository();

  static async getAllCategories() {
    return this.categoryRepository.findAll();
  }

  static async getCategoryById(id?: string) {
    if (!id) throw { statusCode: 404, message: "Id não encontrado" };
    const category = await this.categoryRepository.findById(id);
    if (!category) throw { statusCode: 404, message: "Categoria não encontrada" };
    return category;
  }

  static async createCategory(data: CreateCategoryInput) {
    const nameExists = await this.categoryRepository.checkNameExists(data.name);
    if (nameExists)
      throw {
        statusCode: 409,
        message: "Já existe uma categoria com este nome",
      };

    const slugExists = await this.categoryRepository.checkSlugExists(data.slug);
    if (slugExists)
      throw {
        statusCode: 409,
        message: "Já existe uma categoria com este slug",
      };

    return this.categoryRepository.create(data);
  }

  static async updateCategory(id: string, data: UpdateCategoryInput) {
    await this.getCategoryById(id);

    if (data.name) {
      const nameExists = await this.categoryRepository.checkNameExists(
        data.name,
        id,
      );
      if (nameExists)
        throw {
          statusCode: 409,
          message: "Já existe uma categoria com este nome",
        };
    }

    if (data.slug) {
      const slugExists = await this.categoryRepository.checkSlugExists(
        data.slug,
        id,
      );
      if (slugExists)
        throw {
          statusCode: 409,
          message: "Já existe uma categoria com este slug",
        };
    }

    return this.categoryRepository.update(id, data);
  }

  static async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);
    if (category._count && category._count.posts > 0)
      throw {
        statusCode: 400,
        message:
          "Não é possível excluir uma categoria que possui posts associados",
      };

    return this.categoryRepository.delete(id);
  }
}
