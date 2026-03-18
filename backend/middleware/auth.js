const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    req.user = null; // Proceed as guest
    return next();
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    req.user = decoded.user;
  } catch (err) {
    req.user = null;
  }
  next();
};

const requireAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = { authMiddleware, requireAuth };
