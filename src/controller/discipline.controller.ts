import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../util/response";
import {
  createDisciplineSchema,
  updateDisciplineSchema
} from "@schemas/discipline.schema";
import { DisciplineService } from "service/discipline.service";

export class DisciplineController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createDisciplineSchema.parse(req.body);
      const discipline = await DisciplineService.createDiscipline(parsed);
      return sendSuccess(res, "Disciplina criada com sucesso", discipline);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const parsed = updateDisciplineSchema.parse(req.body);
      const discipline = await DisciplineService.updateDiscipline(id, parsed);
      return sendSuccess(res, "Disciplina atualizada com sucesso", discipline);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const discipline = await DisciplineService.getDiscipline(
        req.params.id as string,
      );
      return sendSuccess(res, "Disciplina encontrada", discipline);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const disciplines = await DisciplineService.listDisciplines(filters);
      return sendSuccess(res, "Lista de disciplinas", disciplines);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const discipline = await DisciplineService.deleteDiscipline(
        req.params.id as string,
      );
      return sendSuccess(res, "Disciplina deletada com sucesso", discipline);
    } catch (err) {
      next(err);
    }
  }
}
