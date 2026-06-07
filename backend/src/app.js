const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5502',
    'http://localhost:5502'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'stokko_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/stores',        require('./routes/stores'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

const { cartRouter, orderRouter, notifRouter } = require('./routes/cartOrderNotif');
app.use('/api/cart',          cartRouter);
app.use('/api/orders',        orderRouter);
app.use('/api/notifications', notifRouter);

// Sprint 4 — akan ditambahkan nanti:
app.use('/api/insights', require('./routes/insightRoutes'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Terjadi kesalahan server.' });
});

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 STOKKO Backend running on http://localhost:${PORT}`);
});

module.exports = app;