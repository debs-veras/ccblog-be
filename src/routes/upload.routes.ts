import { Router } from "express";
import { upload, uploadImage } from "../middleware/upload";
import { authMiddleware } from "middleware/auth.middleware";
import { roleMiddleware } from "middleware/permissions.middleware";
import { sendSuccess } from "util/response";

const router = Router();

router.post(
  "/",
  upload.single("image"),
  authMiddleware,
  roleMiddleware(["ADMIN", "AUTHOR"]),
  uploadImage,
  (req, res) => {
    return sendSuccess(res, "Imagem enviada com sucesso", {
      url: req.body.imageUrl,
    });
  },
);

export default router;
