const productModel = require('../models/productModel');
const { cloudinary } = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/response');
require('dotenv').config();

// GET /api/products
const getAll = async (req, res) => {
  try {
    const { category, search, seller_id } = req.query;
    const products = await productModel.getAll({ category, search, seller_id });
    return successResponse(res, 'Berhasil mengambil products.', { products });
  } catch (err) {
    console.error('getAll products error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// GET /api/products/:id
const getById = async (req, res) => {
  try {
    const product = await productModel.getById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Produk tidak ditemukan.', 404);
    }
    await productModel.incrementViews(req.params.id);
    return successResponse(res, 'OK', { products: productsWithInsights });
  } catch (err) {
    console.error('getById product error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// GET /api/seller/products
const getBySeller = async (req, res) => {
  try {
    const products = await productModel.getBySeller(req.user.id);
    
    // ============================================================
    // LOGIKA SMART PRICING  
    // ============================================================
    const productsWithInsights = products.map(product => {
      // Jaga-jaga kalau format object DB-nya butuh diubah
      const item = product.toJSON ? product.toJSON() : { ...product };

      const views = item.views || 0;
      const sales = item.sales_count || 0;
      
      const conversionRate = views > 0 ? (sales / views) * 100 : 0; 
      
      let action = 'Keep';
      let suggestionText = 'Harga saat ini sudah wajar dan pas.';

      // Hanya beri saran kalau udah dilihat lebih dari 20 kali biar datanya valid
      if (views > 0) {
          if (conversionRate < 5) {
              action = 'Decrease';
              suggestionText = 'Banyak dilihat tapi jarang dibeli. Coba turunkan harga sedikit.';
          } else if (conversionRate >= 20) {
              action = 'Increase';
              suggestionText = 'Produk laku keras! Peluang bagus untuk menaikkan margin profit.';
          }
      }

      return {
          ...item,
          recommendedAction: action,
          reason: suggestionText
      };
    });
 

    // Kirim data yang udah ada insight-nya ke frontend

    return successResponse(res, 'OK', { products });
  } catch (err) {
    console.error('getBySeller error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// POST /api/seller/products
const create = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      if (req.file?.path) {
        const publicId = req.file.public_id || req.file.filename;
        await cloudinary.uploader.destroy(publicId);
      }
      return errorResponse(res, 'Nama, kategori, harga, dan stok wajib diisi.', 400);
    }

    const validCategories = ['Meat', 'Vegetables', 'Dairy', 'Fruits', 'Other', 'Snacks', 'Drinks'];
    if (!validCategories.includes(category)) {
      return errorResponse(res, 'Kategori tidak valid.', 400);
    }

    if (isNaN(price) || price < 0) {
      return errorResponse(res, 'Harga tidak valid.', 400);
    }

    if (isNaN(stock) || stock < 0) {
      return errorResponse(res, 'Stok tidak valid.', 400);
    }

    const imageUrl = req.file ? req.file.path : null;

    const productId = await productModel.create({
      sellerId: req.user.id,
      name,
      category,
      price: parseInt(price),
      stock: parseInt(stock),
      imageUrl,
    });

    const product = await productModel.getById(productId);
    return successResponse(res, 'Produk berhasil ditambahkan.', { product }, 201);
  } catch (err) {
    console.error('create product error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// PUT /api/seller/products/:id
const update = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updated = await productModel.update(req.params.id, req.user.id, {
      name, category,
      price: price !== undefined ? parseInt(price) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      imageUrl,
    });

    if (!updated) {
      return errorResponse(res, 'Produk tidak ditemukan atau bukan milik kamu.', 404);
    }

    return successResponse(res, 'Produk berhasil diupdate.');
  } catch (err) {
    console.error('update product error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// DELETE /api/seller/products/:id
const remove = async (req, res) => {
  try {
    const deleted = await productModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return errorResponse(res, 'Produk tidak ditemukan atau bukan milik kamu.', 404);
    }
    return successResponse(res, 'Produk berhasil dihapus.');
  } catch (err) {
    console.error('remove product error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// PATCH /api/seller/products/:id/boost
const toggleBoost = async (req, res) => {
  try {
    const result = await productModel.toggleBoost(req.params.id, req.user.id);
    if (result === null) {
      return errorResponse(res, 'Produk tidak ditemukan atau bukan milik kamu.', 404);
    }
    return successResponse(res, result ? 'Produk berhasil di-boost!' : 'Boost produk dinonaktifkan.', { is_boosted: result });
  } catch (err) {
    console.error('toggleBoost error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = { getAll, getById, getBySeller, create, update, remove, toggleBoost };