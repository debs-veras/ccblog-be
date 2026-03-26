import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/constants";
import { UserRepository } from "repositories/user.repository";

export class AuthService {
  // Login
  static async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw { statusCode: 401, message: "Credenciais inválidas" };
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw { statusCode: 401, message: "Credenciais inválidas" };
    if (!JWT_SECRET) throw { statusCode: 500, message: "JWT não configurado" };
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
  
  // Alterar Senha
  static async changePassword( currentPassword: string, newPassword: string, email?: string ) {
    if (!email) throw { statusCode: 401, message: "Usuário não autenticado" };
    const user = await UserRepository.findByEmail(email);
    if (!user)  throw { statusCode: 404, message: "Usuário não encontrado" };
    
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    
    if (!passwordMatches) throw { statusCode: 401, message: "Senha atual incorreta" };
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(user.id, hashedPassword);
  }
}
