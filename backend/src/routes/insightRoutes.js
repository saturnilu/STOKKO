const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');

// Import middleware yang benar sesuai buatan temanmu
const { verifyToken } = require('../middleware/auth'); 

// (Opsional) Kalau kamu mau langsung mengunci fitur ini KHUSUS untuk pembeli Premium:
// const { requirePremium } = require('../middleware/premium');

// Router untuk GET /api/insights
// Gunakan verifyToken untuk memastikan user sudah login
router.get('/', verifyToken, insightController.getDashboardInsights);

/* Catatan: Kalau nanti aplikasinya sudah siap rilis dan fitur Insight 
  benar-benar mau dikunci buat user Premium saja, cukup ubah baris di atas menjadi:
  router.get('/', verifyToken, requirePremium, insightController.getDashboardInsights);
*/

module.exports = router;