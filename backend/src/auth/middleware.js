import { verifyToken } from './utils.js';

function isApiRequest(req) {
  return req.originalUrl?.startsWith('/api/');
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    if (isApiRequest(req)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.status(401).redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    if (isApiRequest(req)) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(401).redirect('/login');
  }

  req.user = decoded;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      if (isApiRequest(req)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }
      return res.status(403).render('403', { error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}
