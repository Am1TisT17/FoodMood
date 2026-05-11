import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import { forwardToOCR } from '../services/ocrClient.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Frontend Scanner.tsx posts FormData with field name "image".
// Returns the same shape (ScannedItem[]) that the frontend already expects:
//   { items: [{ name, price, expiryDate, confidence }], rawText, meanConfidence }
router.post('/', authRequired, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded (field: image)' });
    const result = await forwardToOCR(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
