const db = require('../config/db');

// Buat order baru dari cart
const create = async (buyerId, { subtotal, tax, total, paymentMethod, paymentDetail, notes }) => {
  const [result] = await db.query(
    `INSERT INTO orders (buyer_id, subtotal, tax, total, payment_method, payment_detail, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [buyerId, subtotal, tax, total, paymentMethod, paymentDetail || null, notes || null]
  );
  return result.insertId;
};

// Insert item-item order
const createItems = async (orderId, items) => {
  const values = items.map(item => [orderId, item.product_id, item.seller_id, item.quantity, item.price]);
  await db.query(
    `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price) VALUES ?`,
    [values]
  );
};

// Ambil semua order milik buyer
const getByBuyer = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT o.*,
            GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS item_names
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE o.buyer_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [buyerId]
  );
  return rows;
};

// Ambil semua order yang mengandung produk seller tertentu
const getBySeller = async (sellerId) => {
  const [rows] = await db.query(
    `SELECT o.id, o.status, o.created_at, o.payment_method,
            SUM(oi.price * oi.quantity) AS seller_total,
            GROUP_CONCAT(CONCAT(p.name, ' (x', oi.quantity, ')') ORDER BY p.name SEPARATOR '<br>') AS item_display,
            u.username AS buyer_name
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     JOIN users u ON o.buyer_id = u.id
     WHERE oi.seller_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [sellerId]
  );
  return rows;
};

// Detail satu order
const getById = async (orderId) => {
  const [orders] = await db.query(
    `SELECT o.*, u.username AS buyer_name
     FROM orders o
     JOIN users u ON o.buyer_id = u.id
     WHERE o.id = ?`,
    [orderId]
  );
  if (!orders.length) return null;

  const [items] = await db.query(
    `SELECT oi.*, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { ...orders[0], items };
};

// Update status order (seller)
const updateStatus = async (orderId, sellerId, status) => {
  // Pastikan order ini memang punya produk dari seller tsb
  const [check] = await db.query(
    `SELECT DISTINCT o.id FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     WHERE o.id = ? AND oi.seller_id = ?`,
    [orderId, sellerId]
  );
  if (!check.length) return false;

  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return true;
};

module.exports = { create, createItems, getByBuyer, getBySeller, getById, updateStatus };