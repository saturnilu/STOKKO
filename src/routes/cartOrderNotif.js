const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');

// ─── Cart ─────────────────────────────────────────────────────
const cartRouter  = express.Router();
const cartCtrl    = require('../controllers/cartController');

cartRouter.get   ('/',            verifyToken, requireRole('buyer'), cartCtrl.getCart);
cartRouter.post  ('/',            verifyToken, requireRole('buyer'), cartCtrl.addItem);
cartRouter.put   ('/:productId',  verifyToken, requireRole('buyer'), cartCtrl.updateItem);
cartRouter.delete('/:productId',  verifyToken, requireRole('buyer'), cartCtrl.removeItem);
cartRouter.delete('/',            verifyToken, requireRole('buyer'), cartCtrl.clearCart);

// ─── Orders ───────────────────────────────────────────────────
const orderRouter = express.Router();
const orderCtrl   = require('../controllers/orderController');

orderRouter.post  ('/',           verifyToken, orderCtrl.createOrder);
orderRouter.get   ('/',           verifyToken, orderCtrl.getOrders);
orderRouter.get   ('/:id',        verifyToken, orderCtrl.getOrderById);
orderRouter.patch ('/:id/status', verifyToken, requireRole('seller'), orderCtrl.updateStatus);

// ─── Notifications ────────────────────────────────────────────
const notifRouter = express.Router();
const notifCtrl   = require('../controllers/notificationController');

notifRouter.get   ('/',           verifyToken, notifCtrl.getAll);
notifRouter.patch ('/read-all',   verifyToken, notifCtrl.markAllRead);
notifRouter.patch ('/:id/read',   verifyToken, notifCtrl.markRead);
notifRouter.delete('/:id',        verifyToken, notifCtrl.remove);

module.exports = { cartRouter, orderRouter, notifRouter };