import { RegisterUserInput, registerUserSchema, UpdateUserInput } from "@schemas/user.shema";
import bcrypt from "bcrypt";
import { UserFilter } from "models/user.model";
import { UserRepository } from "repositories/user.repository";
import { AppError } from "errors/appError";

export class UserService {
  // Listar todos os usuários (com filtros opcionais)
  static async getAllUsers(filters?: UserFilter) {
    return UserRepository.getAll(filters);
  }

  // Buscar usuário por ID
  static async getUserById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError("Usuário não encontrado", 404);
    return user;
  }

  // Criar usuário
  static async createUser(data: RegisterUserInput) {
    // Valida usando schema
    const parsed = registerUserSchema.parse(data);
    // Verifica se email já existe
    const existingUser = await UserRepository.findByEmail(parsed.email);
    if (existingUser) throw new AppError("Email já está em uso", 400);

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(parsed.password, 10);
    const newUser = await UserRepository.create({
      ...parsed,
      password: hashedPassword,
    });

    return newUser;
  }

  // Atualizar próprio perfil
  static async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError("Usuário não encontrado", 404);
    return UserRepository.update(userId, data);
  }

  // Atualizar usuário (sem alterar senha)
  static async updateUser(id: string, data: UpdateUserInput) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    // Evita atualizar email para um já existente
    if (data.email && data.email !== user.email) {
      const existingUser = await UserRepository.findByEmail(data.email);
      if (existingUser) throw new AppError("Email já está em uso", 400);
    }
    return UserRepository.update(id, data);
  }

  // Deletar usuário
  static async deleteUser(id: string) {
    const user = await UserRepository.findById(id);

    if (!user) throw new AppError("Usuário não encontrado", 404);

    // Verifica posts
    const postsCount = await UserRepository.countPostsByUser(id);
    if (postsCount > 0)
      throw new AppError("Usuário possui posts e não pode ser deletado", 400);

    // Se for professor, verifica disciplinas
    if (user.role === "TEACHER") {
      const disciplinesCount = await UserRepository.countDisciplinesByTeacher(id);

      if (disciplinesCount > 0)
        throw new AppError("Professor possui disciplinas vinculadas", 400);
    }

    return UserRepository.delete(id);
  }
}
