import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ 
    storage: storage ,
    limits: {files: 1, fileSize: 5 * 1024 * 1024 }, // 5 MB cap 
    fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    cb(null, true);
  },
});