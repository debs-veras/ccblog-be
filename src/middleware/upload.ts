import multer from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../lib/cloudinary";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    if (!file) return next(new Error("Nenhum arquivo enviado"));

    const buffer = await sharp(file.buffer)
      .resize({ width: 1200 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "uploads",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      stream.end(buffer);
    });

    req.body.imageUrl = result.secure_url;
    next();
  } catch (error) {
    next(error);
  }
};
