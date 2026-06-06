const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
require('dotenv').config();

const generateTokenAndSetCookie = (res, user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// POST /api/auth/register
// Frontend kirim: username, email, phone, password, confirm_password, role
// role didapat dari localStorage (dipilih di role.html sebelum register)
const register = async (req, res) => {
  try {
    const { username, email, phone, password, confirm_password, role } = req.body;

    if (!username || !email || !phone || !password || !confirm_password || !role) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }

    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Nomor HP harus 10-13 digit angka.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Password dan konfirmasi password tidak cocok.' });
    }

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ message: 'Role harus buyer atau seller.' });
    }

    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const existingPhone = await userModel.findByPhone(phone);
    if (existingPhone) {
      return res.status(409).json({ message: 'Nomor HP sudah terdaftar.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await userModel.createUser({ username, email, phone, passwordHash, role });

    // Kalau seller, otomatis buat store
    if (role === 'seller') {
      const db = require('../config/db');
      await db.query(
        `INSERT INTO stores (seller_id, name, member_since) VALUES (?, ?, CURDATE())`,
        [userId, username]
      );
    }
    const user = await userModel.findById(userId);

    const token = generateTokenAndSetCookie(res, user);

    return res.status(201).json({
      message: 'Registrasi berhasil.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/auth/login
// login_email.html kirim: { identifier: email, password }
// login_number.html kirim: { identifier: phone, password }
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/nomor HP dan password wajib diisi.' });
    }

    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await userModel.findByEmail(identifier)
      : await userModel.findByPhone(identifier);

    if (!user) {
      return res.status(401).json({ message: 'Email/nomor HP atau password salah.' });
    }

    // Akun Google tidak punya password
    if (!user.password_hash) {
      return res.status(401).json({
        message: 'Akun ini terdaftar via Google. Silakan login dengan Google.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email/nomor HP atau password salah.' });
    }

    const token = generateTokenAndSetCookie(res, user);

    return res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.status(200).json({ message: 'Logout berhasil.' });
};

// GET /api/auth/me — dipanggil frontend untuk cek siapa yang sedang login
const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// GET /api/auth/google/callback
// Setelah Google OAuth berhasil, redirect ke halaman dashboard sesuai role
const googleCallback = (req, res) => {
  try {
    const user = req.user;
    generateTokenAndSetCookie(res, user);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5500';

    // Redirect ke dashboard sesuai role
    if (user.role === 'seller') {
      return res.redirect(`${clientUrl}/frontend/seller/dashboard/dashboard_seller.html`);
    }
    return res.redirect(`${clientUrl}/frontend/buyer/market/dashboard_buyer.html`);
  } catch (err) {
    console.error('Google callback error:', err);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5500';
    return res.redirect(`${clientUrl}/frontend/screens/login/login_email.html?error=oauth_failed`);
  }
};

module.exports = { register, login, logout, getMe, googleCallback };
