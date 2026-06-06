const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// regis & login biasa
router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/logout',   authController.logout);

// get current user (butuh token)
router.get('/me', verifyToken, authController.getMe);

// Google OAuth
// 1: redirect ke halaman consent Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2: Google redirect balik ke sini setelah user approve
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  authController.googleCallback
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Login dengan Google gagal.' });
});

module.exports = router;
