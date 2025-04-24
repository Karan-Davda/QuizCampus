// src/middleware/authMiddleware.js
const admin = require('firebase-admin');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';

  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: 'No token provided' });

  const token = match[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // user info available in req.user
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;