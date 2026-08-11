import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../util/response";
import { UserService } from "../service/user.service";
import { registerUserSchema, updateUserSchema } from "@schemas/user.shema";
import { AppError } from "errors/appError";

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const users = await UserService.getAllUsers(filters);
      return sendSuccess(res, "Lista de usuários", users);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const user = await UserService.getUserById(id as string);
      return sendSuccess(res, "Usuário encontrado", user);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerUserSchema.parse(req.body);
      const user = await UserService.createUser(parsed);
      return sendSuccess(res, "Usuário criado com sucesso", user);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const parsed = updateUserSchema.parse(req.body);
      const user = await UserService.updateUser(id as string, parsed);
      return sendSuccess(res, "Dados atualizados com sucesso", user);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError("Usuário não autenticado", 401);
      const { name, avatarUrl } = req.body;
      const user = await UserService.updateProfile(userId, { name, avatarUrl });
      return sendSuccess(res, "Perfil atualizado com sucesso", user);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const user = await UserService.deleteUser(id as string);
      return sendSuccess(res, "Usuário deletado com sucesso", user);
    } catch (err) {
      next(err);
    }
  }
}
