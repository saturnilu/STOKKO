const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/stores/:sellerId — info toko untuk halaman seller profile buyer
router.get('/:sellerId', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT s.*, u.username FROM stores s
             JOIN users u ON s.seller_id = u.id
             WHERE s.seller_id = ?`,
            [req.params.sellerId]
        );

        // Kalau store belum ada (seller lama sebelum fitur ini),
        // auto create store pakai username seller
        if (!rows.length) {
            const [userRows] = await db.query(
                'SELECT id, username FROM users WHERE id = ? AND role = "seller"',
                [req.params.sellerId]
            );
            if (!userRows.length) return res.status(404).json({ message: 'Seller tidak ditemukan.' });

            await db.query(
                'INSERT INTO stores (seller_id, name, member_since) VALUES (?, ?, CURDATE())',
                [req.params.sellerId, userRows[0].username]
            );

            const [newRows] = await db.query(
                'SELECT s.*, u.username FROM stores s JOIN users u ON s.seller_id = u.id WHERE s.seller_id = ?',
                [req.params.sellerId]
            );
            return res.status(200).json({ store: newRows[0] });
        }

        return res.status(200).json({ store: rows[0] });
    } catch (err) {
        console.error('getStore error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
