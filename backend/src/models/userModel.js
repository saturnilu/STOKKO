const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE phone = ?',
    [phone]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, username, email, phone, role, google_id, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ username, email, phone, passwordHash, role }) => {
  const [result] = await db.query(
    `INSERT INTO users (username, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, phone, passwordHash, role]
  );
  return result.insertId;
};

module.exports = { findByEmail, findByPhone, findById, createUser };
