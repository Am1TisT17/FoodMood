import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/jwt.js';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';
import { verifyGoogleIdToken, isGoogleConfigured } from '../services/googleAuth.js';

const router = Router();

// ──────────────────────────────────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────────────────────────────────

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

const googleSchema = {
  body: z.object({
    idToken: z.string().min(10),
  }),
};

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

// Issues both tokens, sets the refresh-token httpOnly cookie, and returns
// the standard auth response body (access token in JSON, refresh in cookie).
function issueTokens(res, user) {
  const accessToken = signAccessToken({ sub: user._id.toString() });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return {
    // `token` is kept alongside `accessToken` for backward compatibility with
    // the existing frontend api.ts client which reads `token` from the body.
    token: accessToken,
    accessToken,
    user: user.toPublicJSON(),
  };
}

function newVerificationToken() {
  // 32-byte hex token — 256 bits of entropy, URL-safe.
  return crypto.randomBytes(32).toString('hex');
}

// ──────────────────────────────────────────────────────────────────────────
// Register & login
// ──────────────────────────────────────────────────────────────────────────

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await hashPassword(password);
  const emailVerifyToken = newVerificationToken();
  const emailVerifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const user = await User.create({
    name,
    email,
    passwordHash,
    emailVerified: false,
    emailVerifyToken,
    emailVerifyExpiresAt,
  });

  // Fire-and-forget — never block registration if the SMTP server is slow / down.
  // In dev mode the email body (including the verification link) is logged to stdout.
  sendVerificationEmail(email, emailVerifyToken, name).catch((err) =>
    console.warn('[auth] sendVerificationEmail failed:', err.message)
  );

  res.status(201).json(issueTokens(res, user));
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  res.json(issueTokens(res, user));
});

// ──────────────────────────────────────────────────────────────────────────
// Refresh — silent token rotation
// ──────────────────────────────────────────────────────────────────────────

// Reads the refresh token from the httpOnly cookie, verifies it, and issues a
// new access token (plus a rotated refresh token for added safety).
router.post('/refresh', async (req, res) => {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!cookieToken) return res.status(401).json({ error: 'No refresh token' });
  let payload;
  try {
    payload = verifyToken(cookieToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
  if (payload.type !== 'refresh') {
    return res.status(401).json({ error: 'Wrong token type' });
  }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json(issueTokens(res, user));
});

// ──────────────────────────────────────────────────────────────────────────
// Me / logout
// ──────────────────────────────────────────────────────────────────────────

router.get('/me', authRequired, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

router.post('/logout', (req, res) => {
  // Clear the refresh cookie. The access token is held in memory by the
  // frontend so its disposal is the client's responsibility.
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

// ──────────────────────────────────────────────────────────────────────────
// Email verification
// ──────────────────────────────────────────────────────────────────────────

router.get('/verify-email/:token', async (req, res) => {
  const user = await User.findOne({
    emailVerifyToken: req.params.token,
    emailVerifyExpiresAt: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }
  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpiresAt = undefined;
  await user.save();
  res.json({ ok: true, user: user.toPublicJSON() });
});

// Resend verification email — protected so an attacker can't spam other users.
router.post('/resend-verification', authRequired, async (req, res) => {
  if (req.user.emailVerified) {
    return res.json({ ok: true, alreadyVerified: true });
  }
  const token = newVerificationToken();
  req.user.emailVerifyToken = token;
  req.user.emailVerifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await req.user.save();
  sendVerificationEmail(req.user.email, token, req.user.name).catch((err) =>
    console.warn('[auth] resend sendVerificationEmail failed:', err.message)
  );
  res.json({ ok: true });
});

// ──────────────────────────────────────────────────────────────────────────
// Password reset (stub-with-real-email — link delivery works in production
// when SMTP is configured; in dev the link is logged to stdout)
// ──────────────────────────────────────────────────────────────────────────

router.post(
  '/forgot-password',
  validate({ body: z.object({ email: z.string().email() }) }),
  async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    // Always return success to avoid leaking which emails are registered.
    if (user) {
      const token = newVerificationToken();
      user.emailVerifyToken = token;
      user.emailVerifyExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await user.save();
      sendPasswordResetEmail(user.email, token, user.name).catch((err) =>
        console.warn('[auth] sendPasswordResetEmail failed:', err.message)
      );
    }
    res.json({ ok: true, message: 'If the email exists, a reset link will be sent.' });
  }
);

// Accepts the token from the reset email plus a new password. We reuse the
// emailVerifyToken / emailVerifyExpiresAt fields rather than introducing a
// second pair, since at most one of those flows is active per user at a time.
router.post(
  '/reset-password',
  validate({
    body: z.object({
      token: z.string().min(10),
      password: z.string().min(8).max(128),
    }),
  }),
  async (req, res) => {
    const user = await User.findOne({
      emailVerifyToken: req.body.token,
      emailVerifyExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    user.passwordHash = await hashPassword(req.body.password);
    user.emailVerifyToken = undefined;
    user.emailVerifyExpiresAt = undefined;
    await user.save();
    res.json({ ok: true });
  }
);

// ──────────────────────────────────────────────────────────────────────────
// Google OAuth — POST { idToken } from Google Identity Services
// ──────────────────────────────────────────────────────────────────────────

router.post('/google', validate(googleSchema), async (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(501).json({ error: 'Google sign-in is not configured on this server' });
  }
  let profile;
  try {
    profile = await verifyGoogleIdToken(req.body.idToken);
  } catch (err) {
    return res.status(401).json({ error: `Google verification failed: ${err.message}` });
  }

  // 1. Match by googleId first — the canonical join key.
  // 2. Fall back to matching by email (existing local user linking their Google account).
  let user = await User.findOne({ googleId: profile.googleId });
  if (!user) {
    user = await User.findOne({ email: profile.email });
  }
  if (user) {
    // Link / refresh Google fields on every login.
    let changed = false;
    if (user.googleId !== profile.googleId) {
      user.googleId = profile.googleId;
      changed = true;
    }
    if (profile.emailVerified && !user.emailVerified) {
      user.emailVerified = true;
      changed = true;
    }
    if (profile.picture && user.avatarUrl !== profile.picture) {
      user.avatarUrl = profile.picture;
      changed = true;
    }
    if (changed) await user.save();
  } else {
    // Brand-new account from a Google sign-in. No passwordHash — the user
    // can later set a password via the password-reset flow if they want one.
    user = await User.create({
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      googleId: profile.googleId,
      emailVerified: profile.emailVerified,
      avatarUrl: profile.picture,
    });
  }

  res.json(issueTokens(res, user));
});

export default router;
