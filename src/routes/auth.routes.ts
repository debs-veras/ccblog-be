import { AuthController } from "controller/auth.controller";
import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "middleware/auth.middleware";

const authRouter: ExpressRouter = Router();

// POST /auth/login
authRouter.post("/login", AuthController.login);
// POST /auth/logout
authRouter.post("/logout", authMiddleware, AuthController.logout);
// GET /auth/validate
authRouter.get("/validate", authMiddleware, AuthController.validateToken);
// PATCH /auth/change-password
authRouter.patch( "/change-password", authMiddleware, AuthController.changePassword );

export default authRouter;
