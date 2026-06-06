const cartModel = require('../models/cartModel');
const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const items = await cartModel.getByBuyer(req.user.id);
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax   = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    return successResponse(res, 'OK', { items, subtotal, tax, total });
  } catch (err) {
    console.error('getCart error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// POST /api/cart
const addItem = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return errorResponse(res, 'product_id wajib diisi.', 400);

    const [rows] = await db.query(
      'SELECT stock, is_active FROM products WHERE id = ?', [product_id]
    );
    if (!rows.length || !rows[0].is_active) {
      return errorResponse(res, 'Produk tidak ditemukan.', 404);
    }
    if (rows[0].stock < quantity) {
      return errorResponse(res, 'Stok produk tidak mencukupi.', 400);
    }

    await cartModel.addOrUpdate(req.user.id, product_id, quantity);
    return successResponse(res, 'Produk berhasil ditambahkan ke cart.');
  } catch (err) {
    console.error('addItem error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// PUT /api/cart/:productId
const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return errorResponse(res, 'Quantity minimal 1.', 400);
    }

    const [rows] = await db.query('SELECT stock FROM products WHERE id = ?', [req.params.productId]);
    if (!rows.length) return errorResponse(res, 'Produk tidak ditemukan.', 404);
    if (rows[0].stock < quantity) {
      return errorResponse(res, 'Stok produk tidak mencukupi.', 400);
    }

    const updated = await cartModel.updateQuantity(req.user.id, req.params.productId, quantity);
    if (!updated) return errorResponse(res, 'Item tidak ada di cart.', 404);

    return successResponse(res, 'Quantity berhasil diupdate.');
  } catch (err) {
    console.error('updateItem error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// DELETE /api/cart/:productId
const removeItem = async (req, res) => {
  try {
    const removed = await cartModel.removeItem(req.user.id, req.params.productId);
    if (!removed) return errorResponse(res, 'Item tidak ada di cart.', 404);
    return successResponse(res, 'Item berhasil dihapus dari cart.');
  } catch (err) {
    console.error('removeItem error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await cartModel.clearCart(req.user.id);
    return successResponse(res, 'Cart berhasil dikosongkan.');
  } catch (err) {
    console.error('clearCart error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };