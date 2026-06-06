const db = require('../config/db');

const getByBuyer = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT ci.*, p.name, p.price, p.stock, p.image_url, p.category,
            s.name AS store_name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN stores s ON p.seller_id = s.seller_id
     WHERE ci.buyer_id = ?`,
    [buyerId]
  );
  return rows;
};

const addOrUpdate = async (buyerId, productId, quantity = 1) => {
  await db.query(
    `INSERT INTO cart_items (buyer_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
    [buyerId, productId, quantity, quantity]
  );
};

const updateQuantity = async (buyerId, productId, quantity) => {
  const [result] = await db.query(
    `UPDATE cart_items SET quantity = ?
     WHERE buyer_id = ? AND product_id = ?`,
    [quantity, buyerId, productId]
  );
  return result.affectedRows > 0;
};

const removeItem = async (buyerId, productId) => {
  const [result] = await db.query(
    `DELETE FROM cart_items WHERE buyer_id = ? AND product_id = ?`,
    [buyerId, productId]
  );
  return result.affectedRows > 0;
};

const clearCart = async (buyerId) => {
  await db.query('DELETE FROM cart_items WHERE buyer_id = ?', [buyerId]);
};

module.exports = { getByBuyer, addOrUpdate, updateQuantity, removeItem, clearCart };