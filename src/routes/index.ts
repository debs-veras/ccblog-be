import { Router, type Router as ExpressRouter } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import postRouter from "./post.routes";
import uploadRouter from "./upload.routes";
import categoryRouter from "./category.routes";
import { disciplineRouter } from "./discipline.routes";
import { enrollmentRouter } from "./enrollment.routes";
import { dashboardRouter } from "./dashboard.routes";
import aiRouter from "./ai.routes";
import notificationRouter from "./notification.routes";
import { NotificationJob } from "service/notificationJob.service";

const routes: ExpressRouter = Router();
routes.use("/auth", authRouter);
routes.use("/user", userRouter);
routes.use("/post", postRouter);
routes.use("/upload", uploadRouter);
routes.use("/category", categoryRouter);
routes.use("/discipline", disciplineRouter);
routes.use("/enrollment", enrollmentRouter);
routes.use("/dashboard", dashboardRouter);
routes.use("/ai", aiRouter);
routes.use("/notifications", notificationRouter);
routes.post("/cron/send-daily-classes", async (req, res) => {
  try {
    await NotificationJob.sendDailyClasses();
    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
    });
  }
});

export default routes;
