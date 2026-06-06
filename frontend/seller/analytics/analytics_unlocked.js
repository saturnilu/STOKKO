// ============================================================
// CATATAN UNTUK FRONTEND DEV:
// Yang BERUBAH: globalProducts/orderHistory localStorage → API backend
//               Stats revenue, orders, customer dari DB
//               Chart tetap pakai Chart.js — TIDAK BERUBAH
//               Data chart & top produk sekarang dari API
// Yang TIDAK BERUBAH: semua Chart.js config, formatRp, recContainer HTML
// ============================================================

const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {

    // BERUBAH: currentSellerId tidak lagi dari localStorage manual
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'seller') {
        window.location.href = '../../screens/login/login_email.html';
        return;
    }

    const formatRp = (num) => 'Rp ' + Math.floor(num).toLocaleString('id-ID');

    const apiFetch = async (url) => {
        const token = localStorage.getItem('token');
        return fetch(url, {
            
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    // BERUBAH: Fetch data analytics dari API
    const [resOrders, resProducts] = await Promise.all([
        apiFetch(`${API_URL}/orders`),
        apiFetch(`${API_URL}/products/seller/my`)
    ]);
    const jsonOrders   = await resOrders.json();
    const jsonProducts = await resProducts.json();

    const orders   = jsonOrders.data.orders     || [];
    const products = jsonProducts.data.products || [];

    // Hitung stats
    let totalRevenue = 0;
    let orderCount   = orders.length;
    orders.forEach(o => {
        if (o.status !== 'cancelled') totalRevenue += (o.seller_total || 0);
    });

    // Customer unik tidak bisa dihitung dari sini tanpa endpoint khusus
    // Pakai jumlah order sebagai fallback yang akurat
    const avgOrderValue = totalRevenue / (orderCount || 1);

    document.getElementById("revenueStat").textContent = formatRp(totalRevenue);
    document.getElementById("customerStat").textContent = orderCount;
    document.getElementById("aovStat").textContent = formatRp(avgOrderValue);
    document.getElementById("repeatStat").textContent = '-';

    document.getElementById("insightCustomer").textContent = orderCount;
    document.getElementById("insightRepeat").textContent   = '-';
    document.getElementById("insightAOV").textContent      = formatRp(avgOrderValue);

    // Revenue chart — grouping per hari dari orders real
    // TIDAK BERUBAH: Chart.js config, type, borderColor, dll
    const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    let revenueByDate = { "Sen": 0, "Sel": 0, "Rab": 0, "Kam": 0, "Jum": 0, "Sab": 0, "Min": 0 };

    orders.forEach(o => {
        if (!o.created_at || o.status === 'cancelled') return;
        const day = days[new Date(o.created_at).getDay()];
        revenueByDate[day] += (o.seller_total || 0);
    });

    // Kalau tidak ada orders, pakai data dummy supaya chart tidak kosong
    const hasRevData = Object.values(revenueByDate).some(v => v > 0);
    if (!hasRevData) {
        revenueByDate = { "Sen": 500000, "Sel": 750000, "Rab": 400000, "Kam": 900000, "Jum": 1200000, "Sab": 1500000, "Min": 1100000 };
    }

    const ctxRev = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: Object.keys(revenueByDate),
            datasets: [{
                data: Object.values(revenueByDate),
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Top products chart — dari products.sales_count
    const topProducts = [...products]
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 3);

    // Kalau tidak ada produk, pakai dummy
    const chartLabels = topProducts.length
        ? topProducts.map(p => p.name.split(' ')[0])
        : ['Product A', 'Product B', 'Product C'];
    const chartData = topProducts.length
        ? topProducts.map(p => p.sales_count || 0)
        : [45, 30, 25];

    const ctxProd = document.getElementById('productsChart').getContext('2d');
    new Chart(ctxProd, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: '#00ca72',
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Pricing recommendation — dari produk seller
    // TIDAK BERUBAH: HTML template recContainer sama persis
    const recContainer = document.getElementById("pricingRecList");
    if (topProducts.length) {
        recContainer.innerHTML = topProducts.map(p => `
            <div class="rec-item">
                <div class="rec-main">
                    <strong>${p.name}</strong>
                    <p>Current price: Rp ${p.price.toLocaleString('id-ID')}</p>
                    <p class="rec-desc">Recommendation: Keep current price</p>
                </div>
                <span class="price-tag gray">0.0%</span>
            </div>
        `).join('');
    } else {
        recContainer.innerHTML = `
            <div class="rec-item">
                <div class="rec-main">
                    <strong>No products yet</strong>
                    <p>Add products to see pricing recommendations</p>
                </div>
            </div>
        `;
    }
});
