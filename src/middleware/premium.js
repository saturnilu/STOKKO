const db = require('../config/db');

// Cek apakah user punya subscription aktif
// Gunakan setelah verifyToken
const requirePremium = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM subscriptions
       WHERE user_id = ? AND is_active = 1 AND expires_at > NOW()`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(403).json({
        message: 'Fitur ini khusus untuk pengguna Premium. Silakan upgrade subscription kamu.',
        isPremium: false,
      });
    }

    req.subscription = rows[0];
    next();
  } catch (err) {
    console.error('requirePremium error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = { requirePremium };
