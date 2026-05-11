import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import { preprocessReceipt } from './preprocess.js';
import { parseReceipt } from './parser.js';

const PORT = parseInt(process.env.PORT || '4100', 10);
const TESSERACT_LANG = process.env.TESSERACT_LANG || 'eng';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN.includes('*') ? true : CORS_ORIGIN }));
app.use(morgan('dev'));

// Reuse a single Tesseract worker across requests — cold start is ~2s, hot is ~200ms.
let workerPromise = null;
async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker(TESSERACT_LANG);
      return worker;
    })();
  }
  return workerPromise;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'ocr', lang: TESSERACT_LANG }));

app.post('/ocr/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded (field name: image)' });
    const cleaned = await preprocessReceipt(req.file.buffer);
    const worker = await getWorker();
    const result = await worker.recognize(cleaned);
    const items = parseReceipt(result);
    res.json({
      items,
      rawText: result.data.text,
      meanConfidence: result.data.confidence,
    });
  } catch (err) {
    console.error('[ocr]', err);
    res.status(500).json({ error: 'OCR failed', detail: err.message });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const server = app.listen(PORT, () => {
  console.log(`[ocr] listening on :${PORT}`);
});

async function shutdown() {
  console.log('[ocr] shutting down...');
  try {
    const worker = await workerPromise;
    if (worker) await worker.terminate();
  } catch (_) {}
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
