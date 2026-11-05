const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Requires a valid JWT and loads the user onto req.user
async function authRequired(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Please log in to continue' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ error: 'Account unavailable' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

// Attaches req.user when a valid token is present, but never blocks the request
async function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    // Ignore invalid tokens for optional routes
  }
  next();
}

// Must be used after authRequired
function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = { authRequired, optionalAuth, adminRequired, signToken };
