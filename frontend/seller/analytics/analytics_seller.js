const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Cek User Login
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'seller') {
        window.location.href = '../../screens/login/login_email.html';
        return;
    }

    // 2. Set Header Profile
    const headerName = document.querySelector(".user-profile .user-name") || document.getElementById("headerStoreName");
    const headerEmail = document.querySelector(".user-profile .user-email");
    const headerAvatar = document.querySelector(".avatar");
    const defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp';

    if (headerName) headerName.textContent = currentUser.username || currentUser.name || "Seller";
    if (headerEmail) headerEmail.textContent = currentUser.email || "";
    if (headerAvatar) headerAvatar.src = currentUser.avatar || defaultAvatar;

    // 3. Logic Premium & Buka Halaman
    const isPremium = true; // Hardcoded true untuk testing
    
    if (isPremium) {
        // Tampilkan konten premium, sembunyikan banner gembok
        if (document.getElementById("lockedContent")) document.getElementById("lockedContent").style.display = "none";
        if (document.getElementById("premiumContent")) document.getElementById("premiumContent").style.display = "block";
        if (document.getElementById("premiumBadge")) document.getElementById("premiumBadge").style.display = "inline-block";
        if (document.getElementById("analyticsSubtitle")) document.getElementById("analyticsSubtitle").textContent = "Comprehensive insights into your business performance";

        // Sembunyikan tombol upgrade
        const btnPremiumTop = document.querySelector(".btn-premium-top");
        const goPremiumCard = document.querySelector(".go-premium-card");
        if (btnPremiumTop) btnPremiumTop.style.display = "none";
        if (goPremiumCard) goPremiumCard.style.display = "none";

        // Tarik Data
        await loadAnalyticsData();
    }
});

// Fungsi untuk format mata uang
const formatRp = (num) => 'Rp ' + Math.floor(num).toLocaleString('id-ID');

// Fungsi utama Fetch & Kalkulasi
async function loadAnalyticsData() {
    const apiFetch = async (url) => {
        const token = localStorage.getItem('token');
        return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    };

    try {
        // Hanya perlu fetch orders dan products. Kita hitung analytics secara manual agar sinkron!
        const [resOrders, resProducts] = await Promise.all([
            apiFetch(`${API_URL}/orders`),
            apiFetch(`${API_URL}/products/seller/my`)
        ]);

        const jsonOrders = await resOrders.json();
        const jsonProducts = await resProducts.json();

        const orders = jsonOrders.data?.orders || [];
        const products = jsonProducts.data?.products || [];

        // 4. KALKULASI MANUAL (Sinkron dengan tabel pesanan)
        let totalRevenue = 0;
        let validOrderCount = 0;
        
        // Buat data untuk grafik mingguan sekaligus
        const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
        let revenueByDate = { "Sen": 0, "Sel": 0, "Rab": 0, "Kam": 0, "Jum": 0, "Sab": 0, "Min": 0 };

        orders.forEach(o => {
            if (!o.created_at || o.status === 'cancelled') return;
            
            // Hitung Total Revenue & Orders
            const orderTotal = Number(o.seller_total || o.total || 0);
            totalRevenue += orderTotal;
            validOrderCount++;

            // Masukkan ke grafik hari
            const day = days[new Date(o.created_at).getDay()];
            revenueByDate[day] += orderTotal;
        });

        const avgOrderValue = validOrderCount > 0 ? (totalRevenue / validOrderCount) : 0;

        // 5. UPDATE DOM STATISTIK UTAMA
        if (document.getElementById("revenueStat")) document.getElementById("revenueStat").textContent = formatRp(totalRevenue);
        if (document.getElementById("customerStat")) document.getElementById("customerStat").textContent = validOrderCount; 
        if (document.getElementById("aovStat")) document.getElementById("aovStat").textContent = formatRp(avgOrderValue);
        if (document.getElementById("repeatStat")) document.getElementById("repeatStat").textContent = '-'; // Bisa dikalkulasi terpisah nanti

        // UPDATE DOM INSIGHTS BAWAH
        if (document.getElementById("insightCustomer")) document.getElementById("insightCustomer").textContent = validOrderCount;
        if (document.getElementById("insightRepeat")) document.getElementById("insightRepeat").textContent = '-';
        if (document.getElementById("insightAOV")) document.getElementById("insightAOV").textContent = formatRp(avgOrderValue);

        // 6. RENDER GRAFIK REVENUE (Tren 7 Hari)
        const hasRevData = Object.values(revenueByDate).some(v => v > 0);
        if (!hasRevData) {
            // Data dummy jika belum ada penjualan
            revenueByDate = { "Sen": 500000, "Sel": 750000, "Rab": 400000, "Kam": 900000, "Jum": 1200000, "Sab": 1500000, "Min": 1100000 };
        }

        const ctxRev = document.getElementById('revenueChart');
        if (ctxRev) {
            new Chart(ctxRev.getContext('2d'), {
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
        }

        // 7. RENDER GRAFIK PRODUK TOP
        const topProducts = [...products]
            .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
            .slice(0, 3);

        const chartLabels = topProducts.length ? topProducts.map(p => p.name.split(' ')[0]) : ['Produk A', 'Produk B', 'Produk C'];
        const chartData = topProducts.length ? topProducts.map(p => p.sales_count || 0) : [45, 30, 25];

        const ctxProd = document.getElementById('productsChart');
        if (ctxProd) {
            new Chart(ctxProd.getContext('2d'), {
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
        }

        // 8. RENDER PRICING RECOMMENDATION
        const recContainer = document.getElementById("pricingRecList");
        if (recContainer) {
            if (topProducts.length) {
            recContainer.innerHTML = topProducts.map(p => {
                // Ambil status & reason dari Backend (Default ke Keep kalau belum ada)
                const action = p.recommendedAction || 'Keep';
                const reason = p.reason || 'Recommendation: Keep current price';
                
                // Atur warna dan label persentase sesuai action
                let badgeClass = "gray";
                let badgeText = "0.0%";

                if (action === 'Increase') {
                    badgeClass = "green"; // Bakal jadi warna hijau
                    badgeText = "↑ +5.0%";
                } else if (action === 'Decrease') {
                    badgeClass = "red";   // Bakal jadi warna merah
                    badgeText = "↓ -5.0%";
                }

                return `
                <div class="rec-item">
                    <div class="rec-main">
                        <strong>${p.name}</strong>
                        <p>Current price: ${formatRp(p.price)}</p>
                        <p class="rec-desc">${reason}</p>
                    </div>
                    <span class="price-tag ${badgeClass}">${badgeText}</span>
                </div>
                `;
            }).join('');
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
        }
    } catch (error) {
        console.error("Gagal meload data analytics:", error);
    }
}