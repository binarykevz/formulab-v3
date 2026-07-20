import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'erp_fallback_secret';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, organization: user.organization, department: user.department },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(hdr.split(' ')[1], SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
