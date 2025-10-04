import type { NextFunction } from "express";
import multer from "multer";
import type { Request, Response  } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File size is too large." });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ error: "File limit reached" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ error: "Wrong file type" });
        }   

        return res.status(400).json({ error: err.message });
    }    
    // Handle other errors
    res.status(500).json({ error: "Internal Server Error" });
};

export default errorHandler;


