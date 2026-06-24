import multer from "multer";
import AppError from "../errors/AppError";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "text/csv" && !file.originalname.endsWith(".csv")) {
      cb(new AppError(400, "Only CSV files are allowed"));
      return;
    }
    cb(null, true);
  },
});
