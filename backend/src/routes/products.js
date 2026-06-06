const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { requirePremium } = require('../middleware/premium');
const { uploadProduct } = require('../config/cloudinary');

// ─── Public — buyer market ────────────────────────────────────
// GET /api/products?category=Vegetables&search=tomat
router.get('/', productController.getAll);

// ─── Seller only ──────────────────────────────────────────────
// GET /api/products/seller/my — produk milik seller yang login
router.get('/seller/my',
  verifyToken,
  requireRole('seller'),
  productController.getBySeller
);

// POST /api/products/seller — tambah produk + upload gambar
// Field file: 'image' (sesuai input id="addProductImage" di HTML)
router.post('/seller',
  verifyToken,
  requireRole('seller'),
  uploadProduct.single('image'),
  productController.create
);

// PUT /api/products/seller/:id — edit produk
router.put('/seller/:id',
  verifyToken,
  requireRole('seller'),
  uploadProduct.single('image'),
  productController.update
);

// DELETE /api/products/seller/:id — hapus produk
router.delete('/seller/:id',
  verifyToken,
  requireRole('seller'),
  productController.remove
);

// PATCH /api/products/seller/:id/boost — toggle boost (premium seller)
router.patch('/seller/:id/boost',
  verifyToken,
  requireRole('seller'),
  requirePremium,
  productController.toggleBoost
);

// GET /api/products/:id
router.get('/:id', productController.getById);

module.exports = router;
