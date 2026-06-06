const db = require('../config/db');

// Ambil semua produk aktif (untuk buyer market)
// Boosted produk muncul duluan, lalu verified seller
const getAll = async ({ category, search, seller_id } = {}) => {
  let query = `
    SELECT p.*, s.name AS store_name, s.is_verified, s.logo_url AS store_logo
    FROM products p
    LEFT JOIN stores s ON p.seller_id = s.seller_id
    WHERE p.is_active = 1
  `;
  const params = [];

  if (seller_id) { query += ' AND p.seller_id = ?'; params.push(seller_id); }

  if (category && category !== 'All') {
    query += ' AND p.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }

  // Boosted duluan, lalu verified seller, lalu terbaru
  query += ' ORDER BY p.is_boosted DESC, s.is_verified DESC, p.created_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

// Detail satu produk
const getById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*, s.name AS store_name, s.is_verified, s.logo_url AS store_logo,
            s.location AS store_location, s.response_time, s.total_sales
     FROM products p
     LEFT JOIN stores s ON p.seller_id = s.seller_id
     WHERE p.id = ? AND p.is_active = 1`,
    [id]
  );
  return rows[0] || null;
};

// Produk milik seller tertentu
const getBySeller = async (sellerId) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE seller_id = ? AND is_active = 1
     ORDER BY created_at DESC`,
    [sellerId]
  );
  return rows;
};

// Tambah produk baru
const create = async ({ sellerId, name, category, price, stock, imageUrl }) => {
  const [result] = await db.query(
    `INSERT INTO products (seller_id, name, category, price, stock, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sellerId, name, category, price, stock, imageUrl || null]
  );

  // Insert harga awal ke price_history
  await db.query(
    `INSERT INTO price_history (product_id, price, recorded_at)
     VALUES (?, ?, CURDATE())`,
    [result.insertId, price]
  );

  return result.insertId;
};

// Update produk
const update = async (id, sellerId, { name, category, price, stock, imageUrl }) => {
  // Ambil harga lama dulu untuk cek apakah berubah
  const [oldRows] = await db.query(
    'SELECT price FROM products WHERE id = ? AND seller_id = ?',
    [id, sellerId]
  );
  if (!oldRows.length) return null;

  const fields = [];
  const params = [];

  if (name)     { fields.push('name = ?');      params.push(name); }
  if (category) { fields.push('category = ?');  params.push(category); }
  if (price !== undefined) { fields.push('price = ?'); params.push(price); }
  if (stock !== undefined) { fields.push('stock = ?'); params.push(stock); }
  if (imageUrl) { fields.push('image_url = ?'); params.push(imageUrl); }

  if (!fields.length) return null;

  params.push(id, sellerId);
  await db.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND seller_id = ?`,
    params
  );

  // Kalau harga berubah, catat ke price_history
  if (price !== undefined && price !== oldRows[0].price) {
    await db.query(
      `INSERT INTO price_history (product_id, price, recorded_at)
       VALUES (?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE price = ?`,
      [id, price, price]
    );
  }

  // Kalau stok turun ke 5 atau kurang, trigger notif low stock
  if (stock !== undefined && stock <= 5) {
    const [product] = await db.query('SELECT name FROM products WHERE id = ?', [id]);
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, product_id)
       VALUES (?, 'low_stock', 'Low Stock Alert', ?, ?)`,
      [sellerId, `Stok produk "${product[0]?.name}" tinggal ${stock}!`, id]
    );
  }

  return true;
};

// Soft delete produk
const remove = async (id, sellerId) => {
  const [result] = await db.query(
    'UPDATE products SET is_active = 0 WHERE id = ? AND seller_id = ?',
    [id, sellerId]
  );
  return result.affectedRows > 0;
};

// Toggle boost produk (premium seller only)
const toggleBoost = async (id, sellerId) => {
  const [rows] = await db.query(
    'SELECT is_boosted FROM products WHERE id = ? AND seller_id = ?',
    [id, sellerId]
  );
  if (!rows.length) return null;

  const nowBoosted = !rows[0].is_boosted;
  const boostExpires = nowBoosted
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari ke depan
    : null;

  await db.query(
    'UPDATE products SET is_boosted = ?, boost_expires_at = ? WHERE id = ? AND seller_id = ?',
    [nowBoosted, boostExpires, id, sellerId]
  );

  return nowBoosted;
};

// Increment views saat produk dilihat
const incrementViews = async (id) => {
  await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
};

module.exports = { getAll, getById, getBySeller, create, update, remove, toggleBoost, incrementViews };
