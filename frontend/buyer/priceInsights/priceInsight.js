const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem('token');

    const apiFetch = (url, opts = {}) => fetch(url, {
        ...opts,
        headers: { 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) }
    });

    // ─── Format helpers ─────────────────────────────────────────
    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);

    const formatRibuan = (angka) => {
        if (angka >= 1000) return (angka / 1000).toFixed(1) + 'k';
        return angka;
    };

    const calculateTrend = (current, previous) => {
        if (!previous) return { value: 0, formatted: '0.00%', isUp: false, isDown: false };
        const diff = current - previous;
        const percentage = (diff / previous) * 100;
        return {
            value: percentage,
            formatted: (percentage > 0 ? '+' : '') + percentage.toFixed(2) + '%',
            isUp: percentage > 0,
            isDown: percentage < 0
        };
    };

    // ─── Fetch data dari backend ──────────────────────────────────
    let localProducts = [];
    let storesList    = [];
    let totalSpending = 0;

    try {
        // Ambil semua produk (public endpoint, tidak perlu token)
        const resProducts = await fetch(`${API_URL}/products`);
        const jsonProducts = await resProducts.json();
        const rawProducts  = jsonProducts?.data?.products || [];

        // Ambil orders buyer untuk total spending
        const resOrders = await apiFetch(`${API_URL}/orders`);
        const jsonOrders = await resOrders.json();
        const orders = jsonOrders?.data?.orders || [];
        totalSpending = orders.reduce((sum, o) => {
            if (o.status !== 'cancelled') return sum + Number(o.total || 0);
            return sum;
        }, 0);

        // Bangun localProducts dari data API
        // Karena backend tidak menyimpan price_history per produk,
        // kita gunakan price sebagai "current" dan buat simulasi trend
        // berdasarkan perbandingan harga sekarang vs harga awal (diambil dari history jika ada, atau ≈ price)
        localProducts = rawProducts.map(p => {
            const currentPrice  = Number(p.price);
            // Jika backend mengembalikan history, gunakan. Jika tidak, duplikasi harga sebagai stable.
            const history       = p.price_history || Array(7).fill(currentPrice);
            const previousPrice = history[history.length - 2] ?? currentPrice;

            let totalChange = 0;
            for (let i = 1; i < history.length; i++) {
                totalChange += (history[i] - history[i - 1]);
            }
            const avgDailyChange    = totalChange / Math.max(history.length - 1, 1);
            const predicted7Days    = avgDailyChange * 7;
            const predictedPct      = currentPrice > 0 ? (predicted7Days / currentPrice) * 100 : 0;

            let isSmartPricing = false;
            let smartDesc      = '';
            let message        = 'Prices are currently stable.';

            if (predictedPct > 1.5) {
                isSmartPricing = true;
                smartDesc = `Forecast: Price expected to rise by ${predictedPct.toFixed(1)}% in the next 7 days.`;
                message   = 'Price surge detected - Consider buying now to avoid paying more!';
            } else if (predictedPct < -1.5) {
                isSmartPricing = true;
                smartDesc = `Forecast: Price dropping! Expected to decrease by ${Math.abs(predictedPct).toFixed(1)}% in the next 7 days.`;
                message   = 'Good time to stock up and save money!';
            }

            return {
                id:               p.id,
                name:             p.name,
                category:         p.category,
                currentPrice,
                previousPrice,
                history,
                predictedPercentage: predictedPct,
                message,
                isSmartPricing,
                smartDesc,
                sellerId: p.seller_id,
                storeName: p.store_name || 'Unknown Store',
                totalSales: p.total_sales || 0,
            };
        });

        // Kumpulkan seller unik dari produk
        const sellerMap = {};
        rawProducts.forEach(p => {
            if (p.seller_id && !sellerMap[p.seller_id]) {
                sellerMap[p.seller_id] = {
                    id:         p.seller_id,
                    name:       p.store_name     || 'Unknown Store',
                    totalSales: p.total_sales    || 0,
                };
            }
        });
        storesList = Object.values(sellerMap);

        // ─── Render filter buttons dari produk nyata ─────────────────
        const filterButtonsContainer = document.getElementById('filter-buttons');
        if (filterButtonsContainer) {
            const allBtn = document.createElement('button');
            allBtn.className = 'btn-filter active';
            allBtn.dataset.product = 'All';
            allBtn.textContent = 'All Products';
            filterButtonsContainer.innerHTML = '';
            filterButtonsContainer.appendChild(allBtn);

            // Hanya tampilkan max 6 produk pertama sebagai filter
            localProducts.slice(0, 6).forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'btn-filter';
                btn.dataset.product = String(p.id);
                // Ambil kata pertama nama produk sebagai label filter
                btn.textContent = p.name.split(' ')[0];
                filterButtonsContainer.appendChild(btn);
            });
        }

    } catch (err) {
        console.error('Gagal fetch data price insights:', err);
    }

    let currentProductId = 'All';

    // ─── Render Seller Recommendation ────────────────────────────
    const renderSellerRecommendation = () => {
        if (!storesList.length) {
            const el = document.getElementById('seller-rec-desc');
            if (el) el.textContent = 'Belum ada data toko tersedia.';
            return;
        }

        // Pilih toko dengan total_sales tertinggi
        let bestSeller = storesList[0];
        storesList.forEach(s => {
            if ((s.totalSales || 0) > (bestSeller.totalSales || 0)) bestSeller = s;
        });

        const descEl = document.getElementById('seller-rec-desc');
        if (descEl) {
            descEl.innerHTML = `Based on market trends, we recommend <strong>"${bestSeller.name}"</strong> - they have ${bestSeller.totalSales} total successful transactions and competitive pricing.`;
        }

        const btnRec = document.getElementById('btn-seller-rec');
        if (btnRec) {
            btnRec.addEventListener('click', () => {
                localStorage.setItem('selectedSellerId', bestSeller.id);
                window.location.href = '../market/seller_profile.html';
            });
        }
    };

    // ─── Render Smart Pricing ──────────────────────────────────────
    const renderSmartPricing = () => {
        const container = document.getElementById('smart-pricing-container');
        if (!container) return;

        const smartItems = localProducts.filter(item => item.isSmartPricing);

        if (!smartItems.length) {
            container.innerHTML = '<p style="color:#aaa; font-size:13px; padding:8px 0;">No significant price movements detected right now.</p>';
            return;
        }

        let htmlContent = '';
        smartItems.forEach(item => {
            const isUp       = item.predictedPercentage > 0;
            const colorClass = isUp ? 'text-red' : 'text-green';
            const formatted  = (isUp ? '+' : '') + item.predictedPercentage.toFixed(2) + '%';

            htmlContent += `
                <div class="smart-item">
                    <div class="smart-item-left">
                        <h4>${item.name}</h4>
                        <p class="desc">${item.smartDesc}</p>
                        <p class="price">Current price: ${formatRupiah(item.currentPrice)}</p>
                    </div>
                    <div class="smart-item-right ${colorClass}">${formatted}</div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;
    };

    // ─── Render Chart ──────────────────────────────────────────────
    const renderDynamicChart = (productId) => {
        const filtered = productId === 'All'
            ? localProducts
            : localProducts.filter(item => String(item.id) === String(productId));

        let dailyAverages = [0, 0, 0, 0, 0, 0, 0];
        if (filtered.length > 0) {
            for (let day = 0; day < 7; day++) {
                let sum = 0;
                filtered.forEach(p => { sum += (p.history[day] || p.currentPrice); });
                dailyAverages[day] = sum / filtered.length;
            }
        }

        const maxVal = Math.max(...dailyAverages);
        const yMax   = Math.ceil((maxVal * 1.2) / 5000) * 5000 || 5000;

        document.getElementById('y-label-max').textContent = formatRibuan(yMax);
        document.getElementById('y-label-75').textContent  = formatRibuan(yMax * 0.75);
        document.getElementById('y-label-50').textContent  = formatRibuan(yMax * 0.5);
        document.getElementById('y-label-25').textContent  = formatRibuan(yMax * 0.25);
        document.getElementById('y-label-0').textContent   = '0';

        const xCoords = [40, 163, 287, 410, 533, 657, 780];
        let pathD = '';
        let pointsHTML = '';

        dailyAverages.forEach((val, index) => {
            const x = xCoords[index];
            const y = 200 - (val / yMax) * 180;

            if (index === 0) pathD += `M${x},${y} `;
            else              pathD += `L${x},${y} `;

            pointsHTML += `<circle cx="${x}" cy="${y}" r="5" fill="#4285f4" class="chart-point">
                               <title>${formatRupiah(val)}</title>
                           </circle>`;
        });

        document.getElementById('chart-path').setAttribute('d', pathD);
        document.getElementById('chart-points').innerHTML = pointsHTML;

        const label = productId === 'All'
            ? 'All Products'
            : (filtered[0]?.name || productId);
        document.getElementById('chart-title').innerText = `Average Price Trend (${label})`;
    };

    // ─── Render Monitoring Grid ────────────────────────────────────
    const renderMonitoringGrid = (productId) => {
        const container = document.getElementById('monitoring-grid-container');
        if (!container) return;

        const filtered = productId === 'All'
            ? localProducts
            : localProducts.filter(item => String(item.id) === String(productId));

        if (!filtered.length) {
            container.innerHTML = '<p style="color:#aaa; font-size:13px; padding: 8px 0;">Tidak ada produk tersedia.</p>';
            document.getElementById('total-tracked').innerText  = 0;
            document.getElementById('avg-increase').innerText   = 0;
            document.getElementById('avg-decrease').innerText   = 0;
            document.getElementById('total-spending').innerText = formatRupiah(totalSpending);
            return;
        }

        let htmlContent    = '';
        let countIncrease  = 0;
        let countDecrease  = 0;

        filtered.forEach(item => {
            const trend       = calculateTrend(item.currentPrice, item.previousPrice);
            const isIncrease  = trend.isUp;
            const isDecrease  = trend.isDown;

            if (isIncrease) countIncrease++;
            else if (isDecrease) countDecrease++;

            const boxBorder = isIncrease ? 'border-red-box'   : 'border-green-box';
            const textColor = isIncrease ? 'text-red'         : 'text-green';
            const iconArrow = isIncrease ? 'fa-arrow-up'      : 'fa-arrow-down';
            const borderTop = isIncrease ? 'border-top-red'   : 'border-top-green';

            const iconStyle    = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;margin-right:8px;font-size:12px;';
            const iconRedBg    = `style="${iconStyle}background:#fee2e2;color:#ef4444;"`;
            const iconGreenBg  = `style="${iconStyle}background:#dcfce7;color:#22c55e;"`;
            const footerIcon   = isIncrease
                ? `<i class="fas fa-bolt" ${iconRedBg}></i>`
                : `<i class="fas fa-piggy-bank" ${iconGreenBg}></i>`;

            htmlContent += `
                <div class="monitor-item ${boxBorder}">
                    <div class="monitor-header">
                        <div>
                            <h4>${item.name}</h4>
                            <span class="category">${item.category}</span>
                        </div>
                        <span class="trend ${textColor}"><i class="fas ${iconArrow}"></i> ${trend.formatted}</span>
                    </div>
                    <div class="price-info">
                        <p>Current price: ${formatRupiah(item.currentPrice)}</p>
                        <p class="category">Previous: ${formatRupiah(item.previousPrice)}</p>
                    </div>
                    <div class="monitor-footer ${textColor} ${borderTop}">
                        ${footerIcon} <span>${item.message}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = htmlContent;

        const gridLabel = productId === 'All' ? 'All' : (filtered[0]?.name || productId);
        document.getElementById('grid-title').innerText     = `Product Price Monitoring (${gridLabel})`;
        document.getElementById('avg-increase').innerText   = countIncrease;
        document.getElementById('avg-decrease').innerText   = countDecrease;
        document.getElementById('total-tracked').innerText  = filtered.length;
        document.getElementById('total-spending').innerText = formatRupiah(totalSpending);
    };

    // ─── Setup filter buttons (event delegation) ─────────────────
    const setupFilters = () => {
        const filterContainer = document.getElementById('filter-buttons');
        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-filter');
            if (!btn) return;

            filterContainer.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentProductId = btn.getAttribute('data-product');
            renderDynamicChart(currentProductId);
            renderMonitoringGrid(currentProductId);
        });
    };

    // ─── Initial render ──────────────────────────────────────────
    renderSellerRecommendation();
    renderSmartPricing();
    renderDynamicChart(currentProductId);
    renderMonitoringGrid(currentProductId);
    setupFilters();
});