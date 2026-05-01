import { Request, Response } from "express";
import { AIService } from "../service/ai.service";
import { sendSuccess, sendError } from "../util/response";

export class AIController {
  /**
   * Endpoint para sugerir metadados para uma postagem.
   */
  static async suggestMetadata(req: Request, res: Response) {
    try {
      const { title, content } = req.body;
      const metadata = await AIService.suggestMetadata(title, content);
      return sendSuccess(res, "Metadados gerados com sucesso", metadata);
    } catch (error: any) {
      return sendError(res, "Erro ao gerar metadados via IA", 500, error.message);
    }
  }

  /**
   * Endpoint para o chat acadêmico.
   */
  static async academicChat(req: Request, res: Response) {
    try {
      const { question, history } = req.body;
      const answer = await AIService.askAcademicQuestion(question, history, req.user?.id);
      return sendSuccess(res, "Resposta gerada com sucesso", { answer });
    } catch (error: any) {
      console.error("AI academicChat Error:", error);
      return sendError(
        res,
        "O Assistente Acadêmico está temporariamente indisponível.",
        500,
        error.message,
      );
    }
  }
}
