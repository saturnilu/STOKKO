const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const notifModel = require('../models/notificationModel');

// GET /api/subscriptions/me — cek status subscription user
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM subscriptions WHERE user_id = ?`,
            [req.user.id]
        );
        const sub = rows[0] || { plan: 'free', is_active: 0 };
        const isPremium = sub.is_active && new Date(sub.expires_at) > new Date();
        return res.status(200).json({ subscription: sub, isPremium });
    } catch (err) {
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// POST /api/subscriptions/checkout — aktivasi subscription
router.post('/checkout', verifyToken, async (req, res) => {
    try {
        const { plan, price } = req.body;
        if (!['monthly', 'yearly'].includes(plan)) {
            return res.status(400).json({ message: 'Plan tidak valid.' });
        }

        const startedAt  = new Date();
        const expiresAt  = new Date();
        if (plan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
        if (plan === 'yearly')  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Upsert subscription
        await db.query(
            `INSERT INTO subscriptions (user_id, plan, price, started_at, expires_at, is_active)
             VALUES (?, ?, ?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE
               plan = VALUES(plan), price = VALUES(price),
               started_at = VALUES(started_at), expires_at = VALUES(expires_at), is_active = 1`,
            [req.user.id, plan, price || 0, startedAt, expiresAt]
        );

        // Notifikasi ke user
        await notifModel.create({
            userId:  req.user.id,
            type:    'system',
            title:   'Upgraded to Premium 🎉',
            message: `Selamat! Kamu sekarang Premium ${plan}. Nikmati semua fitur eksklusif STOKKO.`,
        });

        return res.status(200).json({
            message: 'Subscription berhasil diaktifkan.',
            plan, expires_at: expiresAt
        });
    } catch (err) {
        console.error('subscription checkout error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
