import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../util/response";
import { loginSchema } from "@schemas/auth.schema";
import { blacklistToken } from "../middleware/token-blacklist.middleware";
import { AuthService } from "service/auth.service";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);
      const { token, user } = await AuthService.login(
        parsed.email,
        parsed.password,
      );
      return sendSuccess(res, "Login realizado com sucesso", { token, user });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token) blacklistToken(token);
      }
      return sendSuccess(res, "Logout realizado com sucesso", null);
    } catch (err) {
      next(err);
    }
  }

  static async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, "Token válido", { valid: true, user: req.user });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword, email } = req.body;
      if (!currentPassword || !newPassword) throw { statusCode: 400, message: "Dados inválidos" };
      await AuthService.changePassword(
        currentPassword,
        newPassword,
        email
      );
      return sendSuccess(res, "Senha alterada com sucesso", null);
    } catch (err) {
      next(err);
    }
  }
}
