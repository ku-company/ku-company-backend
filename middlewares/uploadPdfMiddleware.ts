import * as MulterPkg from "multer";

// Support both ESM and CJS default export styles under ts-jest
const multerLib: any = (MulterPkg as any).default || (MulterPkg as any);
const storage = multerLib.memoryStorage();

export const uploadPdf = multerLib({
  storage: storage,
  limits: { files: 3, fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!file.mimetype.startsWith("application/pdf")) {
      return cb(new multerLib.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    cb(null, true);
  },
});