import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/constants";
import { UserRepository } from "repositories/user.repository";
import { AppError } from "errors/appError";

export class AuthService {
  // Login
  static async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new AppError("Credenciais inválidas", 401);
    if (!user.password) throw new AppError("Esta conta foi criada com o Google. Por favor, acesse utilizando o Login pelo Google.", 400);
    
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new AppError("Credenciais inválidas", 401);
    if (!JWT_SECRET) throw new AppError("JWT não configurado", 500);
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  // Login com Google
  static async loginWithGoogle(credential: string) {
    if (!credential) 
      throw new AppError("Token do Google é obrigatório", 400);

    // Validação do token junto à API do Google TokenInfo
    let googlePayload: {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: string | boolean;
      aud?: string;
    };

    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!response.ok) throw new Error("Token Google inválido");
      googlePayload = await response.json();
    } catch {
      throw new AppError("Token do Google inválido ou expirado", 401);
    }

    const { sub: googleId, email, name, picture } = googlePayload;

    if (!email) throw new AppError("Não foi possível obter o e-mail da conta do Google", 400);

    // Verificar se já existe um usuário com esse googleId ou email
    let user: any = await UserRepository.findByGoogleId(googleId);

    if (!user) {
      user = await UserRepository.findByEmail(email);

      if (user) {
        // Usuário existe com o e-mail, mas sem googleId vinculado
        // REGRA: Apenas estudantes podem fazer login via Google
        if (user.role !== "STUDENT") 
          throw new AppError("Apenas contas de estudante têm permissão para realizar login pelo Google.", 403);
  
        // Vincular googleId ao usuário existente (preservando foto customizada se já houver)
        const avatarToUpdate = user.avatarUrl ? undefined : picture;
        user = await UserRepository.updateGoogleId(user.id, googleId, avatarToUpdate);
      } else {
        // Novo usuário - por padrão, criado como STUDENT com a foto do Google
        const newUser = await UserRepository.create({
          name: name || email.split("@")[0],
          email,
          role: "STUDENT",
          avatarUrl: picture,
        } as any);

        await UserRepository.updateGoogleId(newUser.id, googleId);
        user = await UserRepository.findByGoogleId(googleId);
      }
    } else {
      // REGRA: Apenas estudantes podem fazer login via Google
      if (user.role !== "STUDENT") {
        throw new AppError(
          "Apenas contas de estudante têm permissão para realizar login pelo Google.",
          403,
        );
      }

      // Preservar a foto personalizada de perfil. Só atribui a foto do Google se o usuário não tiver nenhuma.
      if (!user.avatarUrl && picture) 
        user = await UserRepository.updateAvatarUrl(user.id, picture);
    }

    if (!user) throw new AppError("Erro ao processar login com o Google", 500);

    if (!JWT_SECRET) throw new AppError("JWT não configurado", 500);

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  // Alterar Senha
  static async changePassword(currentPassword: string, newPassword: string, email?: string) {
    if (!email) throw new AppError("Usuário não autenticado", 401);
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new AppError("Usuário não encontrado", 404);
    if (!user.password) throw new AppError("Esta conta foi criada com o Google e não possui uma senha cadastrada.", 400);
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) throw new AppError("Senha atual incorreta", 401);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(user.id, hashedPassword);
  }
}
