const db = require('../config/db');
const notifModel = require('../models/notificationModel');
const { successResponse, errorResponse } = require('../utils/response');

const SUBSCRIPTION_PRICES = {
  monthly: 108900,
  yearly: 1189000,
};

const refreshSubscriptionStatus = async (userId) => {
  await db.query(
    `UPDATE subscriptions
     SET is_active = 0
     WHERE user_id = ?
       AND is_active = 1
       AND expires_at <= NOW()`,
    [userId]
  );
};

const getSubscriptionStatus = async (req, res) => {
  try {
    await refreshSubscriptionStatus(req.user.id);

    const [rows] = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = ?`,
      [req.user.id]
    );

    const subscription = rows[0] || null;
    const isPremium = subscription && subscription.is_active && new Date(subscription.expires_at) > new Date();

    return successResponse(res, 'Status subscription berhasil diambil.', {
      subscription: subscription || { plan: 'free', price: 0, is_active: 0 },
      isPremium,
    });
  } catch (err) {
    console.error('getSubscriptionStatus error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

const checkoutSubscription = async (req, res) => {
  try {
    const { plan, price, payment_method, payment_detail, payment_ref } = req.body;
    const validPlans = ['monthly', 'yearly'];
    const validPaymentMethods = ['qris', 'ewallet', 'card', 'va'];

    if (!validPlans.includes(plan)) {
      return errorResponse(res, 'Plan tidak valid.', 400);
    }

    const paymentMethod = payment_method || 'qris';
    if (!validPaymentMethods.includes(paymentMethod)) {
      return errorResponse(res, 'Metode pembayaran tidak valid.', 400);
    }

    const expectedPrice = SUBSCRIPTION_PRICES[plan];
    const paidPrice = price !== undefined ? Number(price) : expectedPrice;
    if (isNaN(paidPrice) || paidPrice <= 0) {
      return errorResponse(res, 'Harga pembayaran tidak valid.', 400);
    }

    await refreshSubscriptionStatus(req.user.id);

    const [existingRows] = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = ?`,
      [req.user.id]
    );
    const existing = existingRows[0];

    if (existing && existing.is_active && new Date(existing.expires_at) > new Date()) {
      return errorResponse(
        res,
        'Kamu sudah berlangganan Premium. Tunggu hingga durasi habis sebelum melakukan pembayaran subscription lagi.',
        400
      );
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    if (plan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
    if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const subscriptionRef = payment_ref || `SUB-${req.user.id}-${Date.now()}`;

    // 1. Simpan data langganan ke tabel subscriptions
    await db.query(
      `INSERT INTO subscriptions
         (user_id, plan, price, started_at, expires_at, is_active, payment_ref)
       VALUES (?, ?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         plan = VALUES(plan),
         price = VALUES(price),
         started_at = VALUES(started_at),
         expires_at = VALUES(expires_at),
         is_active = VALUES(is_active),
         payment_ref = VALUES(payment_ref)`,
      [req.user.id, plan, paidPrice, startedAt, expiresAt, subscriptionRef]
    );

    // 2. UPDATE STATUS USER JADI PREMIUM (Ini yang ditambahkan agar database sinkron!)
    await db.query(
      `UPDATE users SET is_premium = 1 WHERE id = ?`,
      [req.user.id]
    );

    // 3. Kirim Notifikasi
    await notifModel.create({
      userId: req.user.id,
      type: 'system',
      title: 'Berhasil Berlangganan Premium 🎉',
      message: `Selamat! Kamu sekarang Premium ${plan}. Masa aktif hingga ${expiresAt.toISOString().split('T')[0]}.`, 
    });

    return successResponse(res, 'Subscription berhasil diaktifkan.', {
      subscription: {
        user_id: req.user.id,
        plan,
        price: paidPrice,
        started_at: startedAt,
        expires_at: expiresAt,
        is_active: 1,
        payment_ref: subscriptionRef,
        payment_method: paymentMethod,
        payment_detail: payment_detail || null,
      },
      isPremium: true,
    }, 201);
  } catch (err) {
    console.error('checkoutSubscription error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = { getSubscriptionStatus, checkoutSubscription, refreshSubscriptionStatus };