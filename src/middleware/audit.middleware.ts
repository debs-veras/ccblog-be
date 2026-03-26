import { Request, Response, NextFunction } from "express";
import { ActivityRepository } from "repositories/activity.repository";
import { ActivityService } from "service/activity.service";
import { PostService } from "service/post.service";

export const auditMiddleware =
  (action: "create" | "update" | "delete" | "publish", entity: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any | undefined;
    const entityId = req.params?.id ?? null;

    // Fallback inicial do título
    res.locals.auditTitle = "item";

    const fetchTitleBefore = async () => {
      if (
        entity === "post" &&
        (action === "delete" || action === "publish") &&
        entityId
      ) {
        try {
          const post = await PostService.getPostById(entityId as string);
          res.locals.auditTitle = post?.title ?? "item";
        } catch (err) {
          console.warn("Post não encontrado antes da ação, usando fallback");
        }
      }
    };

    // Se for delete ou publish, busca antes
    const prefetchPromise = fetchTitleBefore();

    // Intercepta res.json para pegar o post real retornado

    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      // Pega o título do post
      res.locals.auditTitle =
        data?.title ?? req.body?.title ?? res.locals.auditTitle ?? "item";

      // Cria atividade sem await, só dispara
      (async () => {
        try {
          const description = ActivityService.buildDescription(
            user?.name ?? "Unknown user",
            action,
            entity,
            res.locals.auditTitle,
          );

          await ActivityRepository.create({
            action,
            entity,
            entityId: entityId ?? data?.id ?? null,
            userId: user?.id ?? null,
            description,
            ip: req.ip ?? "Unknown IP",
            userAgent: req.headers["user-agent"] ?? "Unknown UA",
          });
        } catch (err) {
          console.error("Erro ao registrar atividade", err);
        }
      })();

      return originalJson(data); 
    };

    next();
  };
