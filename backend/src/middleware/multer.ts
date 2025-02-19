// middleware/multer.ts
import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (
    req: Request, 
    file: Express.Multer.File, 
    callback: (error: Error | null, acceptFile: boolean) => void
  ): void => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new Error('Not an image! Please upload an image.'), false);
    }
  }
});