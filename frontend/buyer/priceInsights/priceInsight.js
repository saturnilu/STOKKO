const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Helper Format Uang & UI
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    const formatRibuan = (angka) => {
        if(angka >= 1000) return (angka / 1000).toFixed(1) + 'k';
        return angka;
    };

    // 2. Fetch Data dari Backend
    const fetchInsightsData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Sesi kamu belum aktif atau token tidak ditemukan.");
                return null;
            }

            const res = await fetch(`${API_URL}/insights`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (!res.ok) { throw new Error(json.message); }
            return json.data;

        } catch (err) {
            console.error('Gagal memuat data analitik:', err);
            alert('Gagal memuat data dari server. Coba periksa apakah backend sudah menyala.');
            return null;
        }
    };

    // 3. Render Rekomendasi Toko
    const renderSellerRecommendation = (topSeller) => {
        if (!topSeller) {
            document.getElementById('seller-rec-desc').innerHTML = "Belum ada data transaksi toko yang cukup.";
            return;
        }
        document.getElementById('seller-rec-desc').innerHTML = `Based on your order history and market trends, we recommend <strong>"${topSeller.name}"</strong> - they have ${topSeller.sales} total successful transactions and competitive pricing.`;
        
        document.getElementById('btn-seller-rec').addEventListener('click', () => {
            localStorage.setItem('selectedSellerId', topSeller.id);
            window.location.href = '../market/seller_profile.html';
        });
    };

    // 4. Render Smart Pricing Alerts
    const renderSmartPricing = (products) => {
        const container = document.getElementById("smart-pricing-container");
        const smartItems = products.filter(item => item.isSmartPricing);
        
        let htmlContent = "";
        smartItems.forEach(item => {
            const colorClass = item.trend.isUp ? "text-red" : "text-green";
            htmlContent += `
                <div class="smart-item">
                    <div class="smart-item-left">
                        <h4>${item.name}</h4>
                        <p class="desc">${item.smartDesc}</p>
                        <p class="price">Current price: ${formatRupiah(item.currentPrice)}</p>
                    </div>
                    <div class="smart-item-right ${colorClass}">${item.trend.formatted}</div>
                </div>
            `;
        });
        
        container.innerHTML = htmlContent || '<p style="color:#888; padding: 20px;">Prices are currently stable. No urgent alerts.</p>';
    };

    // 5. Render Grafik SVG
    const renderDynamicChart = (chartAverages) => {
        if (!chartAverages || chartAverages.length === 0) return;

        const maxVal = Math.max(...chartAverages);
        const yMax = Math.ceil((maxVal * 1.2) / 5000) * 5000 || 5000;

        document.getElementById('y-label-max').textContent = formatRibuan(yMax);
        document.getElementById('y-label-75').textContent  = formatRibuan(yMax * 0.75);
        document.getElementById('y-label-50').textContent  = formatRibuan(yMax * 0.5);
        document.getElementById('y-label-25').textContent  = formatRibuan(yMax * 0.25);
        document.getElementById('y-label-0').textContent   = "0";

        const xCoords = [40, 163, 287, 410, 533, 657, 780];
        let pathD = "";
        let pointsHTML = "";

        chartAverages.forEach((val, index) => {
            const x = xCoords[index];
            const y = 200 - (val / yMax) * 180; 
            
            if (index === 0) pathD += `M${x},${y} `;
            else pathD += `L${x},${y} `;
            
            pointsHTML += `<circle cx="${x}" cy="${y}" r="5" fill="#4285f4" class="chart-point">
                              <title>${formatRupiah(val)}</title>
                           </circle>`;
        });

        document.getElementById('chart-path').setAttribute('d', pathD);
        document.getElementById('chart-points').innerHTML = pointsHTML;
        document.getElementById('chart-title').innerText = `Average Price Trend (7 Days)`;
    };

    // 6. Render Monitoring Grid Bawah
    const renderMonitoringGrid = (products, totalSpending) => {
        const container = document.getElementById("monitoring-grid-container");
        let htmlContent = "";
        let countIncrease = 0;
        let countDecrease = 0;

        products.forEach(item => {
            if (item.trend.isUp) countIncrease++;
            else if (item.trend.isDown) countDecrease++;

            const boxBorder = item.trend.isUp ? "border-red-box" : "border-green-box";
            const textColor = item.trend.isUp ? "text-red" : "text-green";
            const iconArrow = item.trend.isUp ? "fa-arrow-up" : "fa-arrow-down";
            const borderTop = item.trend.isUp ? "border-top-red" : "border-top-green";
          
            const iconStyle = "display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; margin-right: 8px; font-size: 12px;";
            const iconBg    = item.trend.isUp ? `style="${iconStyle} background: #fee2e2; color: #ef4444;"` : `style="${iconStyle} background: #dcfce7; color: #22c55e;"`;
            const footerIcon = item.trend.isUp ? `<i class="fas fa-bolt" ${iconBg}></i>` : `<i class="fas fa-piggy-bank" ${iconBg}></i>`;

            htmlContent += `
                <div class="monitor-item ${boxBorder}">
                    <div class="monitor-header">
                        <div>
                            <h4>${item.name}</h4>
                            <span class="category">${item.category}</span>
                        </div>
                        <span class="trend ${textColor}"><i class="fas ${iconArrow}"></i> ${item.trend.formatted}</span>
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
        
        document.getElementById("grid-title").innerText = `Product Price Monitoring`;
        document.getElementById("avg-increase").innerText = countIncrease;
        document.getElementById("avg-decrease").innerText = countDecrease;
        document.getElementById("total-tracked").innerText = products.length;
        document.getElementById("total-spending").innerText = formatRupiah(totalSpending);
    };

    // --- ALUR UTAMA ---
    const initDashboard = async () => {
        // 1. Ambil data dari API backend
        const insightsData = await fetchInsightsData();
        
        // Kalau gagal fetch atau data kosong, berhentikan proses
        if (!insightsData) return;

        // 2. Render seluruh komponen UI
        renderSellerRecommendation(insightsData.topSeller);
        renderSmartPricing(insightsData.products);
        renderDynamicChart(insightsData.chartAverages);
        renderMonitoringGrid(insightsData.products, insightsData.totalSpending);
    };

    // Eksekusi semua proses di atas
    initDashboard();
});