import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

const registerSchema = {
  body: z.object({
    name: z.string().min(1).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken({ sub: user._id.toString() });
  res.status(201).json({ token, user: user.toPublicJSON() });
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ sub: user._id.toString() });
  res.json({ token, user: user.toPublicJSON() });
});

router.get('/me', authRequired, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

// Stateless JWT: client just discards the token. Endpoint kept for symmetry.
router.post('/logout', authRequired, (req, res) => {
  res.json({ ok: true });
});

// Stub — for production, send an email with reset link.
router.post(
  '/forgot-password',
  validate({ body: z.object({ email: z.string().email() }) }),
  async (req, res) => {
    res.json({ ok: true, message: 'If the email exists, a reset link will be sent.' });
  }
);

export default router;
