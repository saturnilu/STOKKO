const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

require('dotenv').config();

// verif JWT dari cookie atau auth header
const verifyToken = (req, res, next) => {
  // cek cookie dulu, fallback ke auth header
  const token = req.cookies?.token ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return errorResponse(res, 'Akses ditolak, silahkan login terlebih dahulu.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return errorResponse(res, err.message || 'Akses ditolak, silahkan login terlebih dahulu.', err.statusCode || 401);
  }
};

// guard role, gunakan setelah verif
// contoh: requireRole('seller') atau requireRole('buyer', 'seller')
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses ditolak. Fitur ini hanya untuk ${roles.join(' atau ')}.`
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
