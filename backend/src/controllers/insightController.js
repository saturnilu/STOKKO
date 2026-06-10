const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response'); // Memakai utils bawaan temanmu

const getDashboardInsights = async (req, res) => {
  try {
    const userId = req.user.id; // Didapat dari token login

    // 1. Ambil Total Spending (Berapa banyak uang yang sudah dibelanjakan buyer ini)
    const [spendingRows] = await db.query(
      `SELECT SUM(total) as total_spent FROM orders WHERE buyer_id = ? AND status != 'cancelled'`,
      [userId]
    );
    const totalSpending = spendingRows[0].total_spent || 0;

    // 2. Cari Top Seller (Toko dengan penjualan tertinggi)
    const [sellerRows] = await db.query(
      `SELECT id, name, total_sales FROM stores ORDER BY total_sales DESC LIMIT 1`
    );
    const topSeller = sellerRows[0] || null;

    // 3. Ambil Semua Produk Aktif untuk dianalisis harganya
    const [products] = await db.query(
      `SELECT id, name, category, price FROM products WHERE is_active = 1`
    );

    let chartAverages = [0, 0, 0, 0, 0, 0, 0];
    let processedProducts = [];

    // Loop setiap produk untuk menghitung Smart Pricing
    for (let p of products) {
      // Ambil 7 riwayat harga terakhir dari database
      const [historyRows] = await db.query(
        `SELECT price FROM price_history WHERE product_id = ? ORDER BY recorded_at DESC LIMIT 7`,
        [p.id]
      );

      // Susun array harga. Kalau riwayat kurang dari 7 hari, isi pakai harga saat ini
      let histPrices = historyRows.map(h => h.price);
      while (histPrices.length < 7) {
        histPrices.push(p.price); 
      }
      histPrices = histPrices.reverse(); // Urutkan dari terlama ke terbaru

      const currentPrice = p.price;
      const previousPrice = histPrices[5]; // Harga kemarin (index 5)

      // --- LOGIKA MATEMATIKA KAMU PINDAH KE SINI ---
      let totalChange = 0;
      for(let i = 1; i < 7; i++) {
          totalChange += (histPrices[i] - histPrices[i-1]);
      }
      let avgDailyChange = totalChange / 6;
      let predicted7DaysChange = avgDailyChange * 7;
      let predictedPercentage = currentPrice === 0 ? 0 : (predicted7DaysChange / currentPrice) * 100;

      let isSmartPricing = false;
      let smartDesc = "";
      let message = "Prices are currently stable.";

      if (predictedPercentage > 1.5) {
          isSmartPricing = true;
          smartDesc = `Forecast: Price expected to rise by ${predictedPercentage.toFixed(1)}% in the next 7 days based on data.`;
          message = "Price surge detected - Consider buying now to avoid paying more!";
      } else if (predictedPercentage < -1.5) {
          isSmartPricing = true;
          smartDesc = `Forecast: Price dropping! Expected to decrease by ${Math.abs(predictedPercentage).toFixed(1)}% in the next 7 days.`;
          message = "Good time to stock up and save money!";
      }

      // Hitung trend hari ini vs kemarin
      const diff = currentPrice - previousPrice;
      const percentage = previousPrice === 0 ? 0 : (diff / previousPrice) * 100;
      const isUp = percentage > 0;
      const isDown = percentage < 0;

      // Masukkan ke array hasil akhir
      processedProducts.push({
          id: p.id,
          name: p.name,
          category: p.category,
          currentPrice,
          previousPrice,
          history: histPrices,
          isSmartPricing,
          smartDesc,
          message,
          trend: {
              isUp,
              isDown,
              formatted: (isUp ? '+' : '') + percentage.toFixed(2) + '%'
          }
      });

      // Tambahkan ke total untuk grafik SVG
      for (let day = 0; day < 7; day++) {
          chartAverages[day] += histPrices[day];
      }
    }

    // Hitung nilai rata-rata final untuk grafik
    if (products.length > 0) {
        for (let day = 0; day < 7; day++) {
            chartAverages[day] = chartAverages[day] / products.length;
        }
    }

    // Kirim JSON ke Frontend!
    return successResponse(res, 'Insights berhasil dimuat.', {
      totalSpending,
      topSeller,
      chartAverages,
      products: processedProducts
    });

  } catch (err) {
    console.error('getDashboardInsights error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = { getDashboardInsights };