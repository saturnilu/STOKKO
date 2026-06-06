const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getSubscriptionStatus, checkoutSubscription } = require('../controllers/subscriptionController');

// GET /api/subscriptions/me — cek status subscription user
router.get('/me', verifyToken, getSubscriptionStatus);

// POST /api/subscriptions/checkout — aktivasi subscription
router.post('/checkout', verifyToken, checkoutSubscription);

module.exports = router;
