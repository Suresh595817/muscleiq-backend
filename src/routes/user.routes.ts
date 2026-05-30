import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { updateProfile, uploadAvatar } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Configure Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    // Unique filename formatting: user-id-timestamp.ext
    const userId = (req as any).user ? (req as any).user.id : 'anonymous';
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configure image validation filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png are supported)!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter,
});

router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
