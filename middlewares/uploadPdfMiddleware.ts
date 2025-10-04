import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ 
    storage: storage ,
    limits: {files: 3, fileSize: 5 * 1024 * 1024},// 5 MB cap 
    fileFilter: (_req, file, cb) => {
    console.log("fileFilter called with:", file.mimetype, file.fieldname);
    if (!file.mimetype.startsWith("application/pdf")) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    cb(null, true);
  },
});