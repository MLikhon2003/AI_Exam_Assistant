import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { createUser, findUserByEmail, findUserById } from '../models/user.model.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash });
  const token = signToken({ sub: user.id, role: user.role });

  res.status(201).json({ token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended.' });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({ sub: user.id, role: user.role });
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

export const me = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json({ user });
});

// FR-05 — logout. JWTs are stateless (no server-side session to destroy),
// so the actual "log the user out" step happens on the client by deleting
// the stored token (see src/data/api.js -> logoutClient() on the frontend).
// This endpoint exists so the frontend has a real request to call as part
// of that flow, and so a token-blacklist/revocation-list could be added
// here later without changing the frontend's logout() call at all.
export const logout = asyncHandler(async (req, res) => {
  res.json({ ok: true, message: 'Logged out successfully.' });
});
