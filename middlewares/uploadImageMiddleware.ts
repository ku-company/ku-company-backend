import * as MulterPkg from "multer";

const multerLib: any = (MulterPkg as any).default || (MulterPkg as any);
const storage = multerLib.memoryStorage();

export const uploadImage = multerLib({
  storage: storage,
  limits: { files: 1, fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new multerLib.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    if (file.mimetype === "image/svg+xml") {
      // Block SVG due to scriptable content risk unless sanitized explicitly.
      return cb(new multerLib.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    cb(null, true);
  },
});