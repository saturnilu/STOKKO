const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Cek User Login
    const currentUserStr = localStorage.getItem('currentUser');
    let currentUser = {};
    if (currentUserStr) {
        currentUser = JSON.parse(currentUserStr);
    }

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

    // 3. CEK STATUS PREMIUM LANGSUNG KE BACKEND (Sama seperti Buyer!)
    let isPremium = false;
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const res = await fetch(`${API_URL}/subscriptions/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                // Jika backend mengkonfirmasi user ini premium
                if (json.data && json.data.isPremium) {
                    isPremium = true;
                    // Update localStorage biar selalu sinkron
                    currentUser.is_premium = 1;
                    currentUser.isPremium = true;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                } else {
                    // Jika langganan sudah habis (expired di backend)
                    currentUser.is_premium = 0;
                    currentUser.isPremium = false;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            }
        } catch (err) {
            console.error("Gagal cek status premium:", err);
            // Fallback: baca dari memory kalau server ngadat
            isPremium = !!(currentUser && (currentUser.is_premium === 1 || currentUser.isPremium === true));
        }
    } else {
        isPremium = !!(currentUser && (currentUser.is_premium === 1 || currentUser.isPremium === true));
    }

    // 4. Logic Premium & Buka Halaman
    const lockedContent = document.getElementById("lockedContent");
    const premiumContent = document.getElementById("premiumContent");
    const premiumBadge = document.getElementById("premiumBadge");
    const analyticsSubtitle = document.getElementById("analyticsSubtitle");
    const btnPremiumTop = document.querySelector(".btn-premium-top");
    const goPremiumCard = document.querySelector(".go-premium-card");

    if (isPremium) {
        // BUKA GEMBOK: Tampilkan konten premium, sembunyikan banner locked
        if (lockedContent) lockedContent.style.display = "none";
        if (premiumContent) premiumContent.style.display = "block";
        if (premiumBadge) premiumBadge.style.display = "inline-block";
        if (analyticsSubtitle) analyticsSubtitle.textContent = "Comprehensive insights into your business performance";

        // Sembunyikan iklan upgrade
        if (btnPremiumTop) btnPremiumTop.style.display = "none";
        if (goPremiumCard) goPremiumCard.style.display = "none";

        // Tarik data grafik dari backend karena dia Premium!
        await loadAnalyticsData();
    } else {
        // KUNCI GEMBOK: Tampilkan banner locked, sembunyikan fitur
        if (lockedContent) lockedContent.style.display = "block";
        if (premiumContent) premiumContent.style.display = "none";
        if (premiumBadge) premiumBadge.style.display = "none";
        if (analyticsSubtitle) analyticsSubtitle.textContent = "Advanced insights for Premium members";

        // Munculkan iklan upgrade
        if (btnPremiumTop) btnPremiumTop.style.display = "flex"; // atau block tergantung css kamu
        if (goPremiumCard) goPremiumCard.style.display = "block";
    }
});

const formatRp = (num) => 'Rp ' + Math.floor(num).toLocaleString('id-ID');

async function loadAnalyticsData() {
    const apiFetch = async (url) => {
        const token = localStorage.getItem('token');
        return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    };

    try {
        const [resOrders, resProducts] = await Promise.all([
            apiFetch(`${API_URL}/orders`),
            apiFetch(`${API_URL}/products/seller/my`)
        ]);

        const jsonOrders = await resOrders.json();
        const jsonProducts = await resProducts.json();

        const orders = jsonOrders.data?.orders || [];
        const products = jsonProducts.data?.products || [];

        // 4. KALKULASI MANUAL 
        let totalRevenue = 0;
        let validOrderCount = 0;
        
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

                const action = p.recommendedAction || 'Keep';
                const reason = p.reason || 'Recommendation: Keep current price';
                
                let badgeClass = "gray";
                let badgeText = "0.0%";

                if (action === 'Increase') {
                    badgeClass = "green";
                    badgeText = "↑ +5.0%";
                } else if (action === 'Decrease') {
                    badgeClass = "red";   
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