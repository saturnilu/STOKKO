const db = require('../config/db');

const getByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

const create = async ({ userId, type, title, message, productId = null, orderId = null }) => {
  await db.query(
    `INSERT INTO notifications (user_id, type, title, message, product_id, order_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, title, message, productId, orderId]
  );
};

const markRead = async (notifId, userId) => {
  const [result] = await db.query(
    `UPDATE notifications SET is_read = 1
     WHERE id = ? AND user_id = ?`,
    [notifId, userId]
  );
  return result.affectedRows > 0;
};

const markAllRead = async (userId) => {
  await db.query(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
    [userId]
  );
};

const remove = async (notifId, userId) => {
  const [result] = await db.query(
    `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
    [notifId, userId]
  );
  return result.affectedRows > 0;
};

module.exports = { getByUser, create, markRead, markAllRead, remove };