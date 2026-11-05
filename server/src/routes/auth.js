const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { authRequired, signToken } = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const validatePassword = (pw) =>
  typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
const PASSWORD_RULE = 'Password must be at least 8 characters and include a letter and a number';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' });
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ error: 'A valid email is required' });
  if (!validatePassword(password)) return res.status(400).json({ error: PASSWORD_RULE });

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' });

  const user = await User.create({
    name: String(name).trim(),
    email,
    phone: phone ? String(phone).trim() : '',
    passwordHash: await bcrypt.hash(password, 12),
  });
  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

// POST /api/auth/login  (customers and admins share this endpoint)
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
  const valid = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!valid) return res.status(401).json({ error: 'Incorrect email or password' });
  if (!user.isActive) return res.status(403).json({ error: 'This account has been disabled. Contact support.' });

  res.json({ token: signToken(user), user: user.toPublic() });
});

// POST /api/auth/forgot-password
// No email service is configured, so the reset link is printed to the server console.
router.post('/forgot-password', async (req, res) => {
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };
  const email = String((req.body || {}).email || '').toLowerCase().trim();
  if (!EMAIL_RE.test(email)) return res.json(generic);

  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
    console.log(`[password reset] ${email}: ${link}`);
  }
  res.json(generic);
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Reset token is missing' });
  if (!validatePassword(password)) return res.status(400).json({ error: PASSWORD_RULE });

  const hash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = await User.findOne({
    resetTokenHash: hash,
    resetTokenExpires: { $gt: new Date() },
  }).select('+resetTokenHash +resetTokenExpires');
  if (!user) return res.status(400).json({ error: 'This reset link is invalid or has expired' });

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: 'Your password has been reset. You can now log in.' });
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

// PUT /api/auth/me  (update profile)
router.put('/me', authRequired, async (req, res) => {
  const { name, phone, address } = req.body || {};
  const user = req.user;
  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'Name cannot be empty' });
    user.name = String(name).trim();
  }
  if (phone !== undefined) user.phone = String(phone).trim();
  if (address !== undefined) {
    user.address = {
      street: String(address.street || '').trim(),
      city: String(address.city || '').trim(),
      postalCode: String(address.postalCode || '').trim(),
      country: String(address.country || '').trim(),
    };
  }
  await user.save();
  res.json({ user: user.toPublic() });
});

// PUT /api/auth/password  (change password while logged in)
router.put('/password', authRequired, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(String(currentPassword || ''), user.passwordHash))) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (!validatePassword(newPassword)) return res.status(400).json({ error: PASSWORD_RULE });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated' });
});

module.exports = router;
