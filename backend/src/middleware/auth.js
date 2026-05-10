const { verifyAccessToken } = require('../utils/auth');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Login karo pehle - token nahi mila' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Invalid token - dobara login karo' });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (tokenErr) {
      if (tokenErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expire ho gaya', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token - dobara login karo' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User nahi mila - dobara login karo' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication fail ho gaya' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required hai' });
  }
  next();
};

const approvedOnly = (req, res, next) => {
  if (!req.user?.isApproved) {
    return res.status(403).json({
      error: 'Account approved nahi hai abhi',
      code: 'PENDING_APPROVAL'
    });
  }
  next();
};

const emailVerified = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      error: 'Email verify karo pehle',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

module.exports = { protect, adminOnly, approvedOnly, emailVerified };
