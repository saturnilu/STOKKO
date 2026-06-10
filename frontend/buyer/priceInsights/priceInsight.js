const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {

    // 1. SETUP USER PROFILE DI HEADER
    const currentUserStr = localStorage.getItem('currentUser');
    let currentUser = {};
    if (currentUserStr) {
        try {
            currentUser = JSON.parse(currentUserStr);
            const headerName = document.getElementById("headerUserName");
            const headerEmail = document.getElementById("headerUserEmail");
            const headerAvatar = document.getElementById("headerAvatar");
            const defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp';

            if (headerName) headerName.textContent = currentUser.username || currentUser.name || "Buyer Stokko";
            if (headerEmail) headerEmail.textContent = currentUser.email || "";
            if (headerAvatar) {
                headerAvatar.onerror = function() { this.src = defaultAvatar; };
                headerAvatar.src = (currentUser.avatar && currentUser.avatar.trim() !== "") ? currentUser.avatar : defaultAvatar;
            }
        } catch (e) {
            console.error("Error parsing user data");
        }
    }

    // 2. CEK STATUS PREMIUM LANGSUNG KE BACKEND (Biar gak bergantung sama cache browser!)
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
                }
            }
        } catch (err) {
            console.error("Gagal cek status premium:", err);
        }
    }

    // 3. TOGGLE TAMPILAN BERDASARKAN STATUS ASLI DARI BACKEND
    const btnPremiumTop = document.getElementById("btn-premium-top");
    const goPremiumCard = document.getElementById("go-premium-card");
    const lockedView = document.getElementById("locked-view");
    const unlockedView = document.getElementById("unlocked-view");
    const badgePremium = document.getElementById("badgePremium");
    const subtitleText = document.getElementById("subtitleText");

    if (isPremium) {
        // BUKA GEMBOK (PREMIUM)
        if (btnPremiumTop) btnPremiumTop.style.display = "none";
        if (goPremiumCard) goPremiumCard.style.display = "none";
        if (lockedView) lockedView.style.display = "none";
        if (unlockedView) unlockedView.style.display = "block";
        if (badgePremium) badgePremium.style.display = "inline-flex";
        if (subtitleText) subtitleText.textContent = "Comprehensive insights into market performance";
        
        // Mulai ambil data grafik
        initPremiumDashboard();
    } else {
        // KUNCI GEMBOK (FREE USER)
        if (btnPremiumTop) btnPremiumTop.style.display = "flex";
        if (goPremiumCard) goPremiumCard.style.display = "block";
        if (lockedView) lockedView.style.display = "block";
        if (unlockedView) unlockedView.style.display = "none";
        if (badgePremium) badgePremium.style.display = "none";
        if (subtitleText) subtitleText.textContent = "Advanced insights for Premium members";
    }

    // ==========================================
    // LOGIC GRAFIK PREMIUM & API FETCHING
    // ==========================================

    async function initPremiumDashboard() {
        const formatRupiah = (angka) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0
            }).format(angka);
        };

        const formatRibuan = (angka) => {
            if (angka >= 1000) return (angka / 1000).toFixed(1) + 'k';
            return angka;
        };

        const fetchInsightsData = async () => {
            try {
                const res = await fetch(`${API_URL}/insights`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                
                if (!res.ok) { throw new Error(json.message); }
                return json.data;

            } catch (err) {
                console.error('Gagal memuat data analitik:', err);
                return null;
            }
        };

        const renderSellerRecommendation = (topSeller) => {
            if (!topSeller) {
                const descEl = document.getElementById('seller-rec-desc');
                if (descEl) descEl.innerHTML = "Belum ada data transaksi toko yang cukup.";
                return;
            }
            
            const descEl = document.getElementById('seller-rec-desc');
            if (descEl) {
                descEl.innerHTML = `Based on market trends, we recommend <strong>"${topSeller.name}"</strong> - they have ${topSeller.total_sales} total successful transactions and competitive pricing.`;
            }

            const btnRec = document.getElementById('btn-seller-rec');
            if (btnRec) {
                btnRec.addEventListener('click', () => {
                    localStorage.setItem('selectedSellerId', topSeller.id);
                    window.location.href = '../market/seller_profile.html';
                });
            }
        };

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

        let globalProducts = [];
        let globalTotalSpending = 0;

        const renderDynamicChart = (filteredProducts, categoryName) => {
            if (!filteredProducts || filteredProducts.length === 0) {
                document.getElementById('chart-path').setAttribute('d', '');
                document.getElementById('chart-points').innerHTML = '';
                document.getElementById('chart-title').innerText = `Average Price Trend (${categoryName}) - No Data`;
                return;
            }
            
            let dailyAverages = [0, 0, 0, 0, 0, 0, 0];
            for (let day = 0; day < 7; day++) {
                let sum = 0;
                filteredProducts.forEach(p => { 
                    sum += (p.history && p.history[day] ? p.history[day] : 0); 
                });
                dailyAverages[day] = sum / filteredProducts.length;
            }

            const maxVal = Math.max(...dailyAverages);
            const yMax = Math.ceil((maxVal * 1.2) / 5000) * 5000 || 5000;

            document.getElementById('y-label-max').textContent = formatRibuan(yMax);
            document.getElementById('y-label-75').textContent  = formatRibuan(yMax * 0.75);
            document.getElementById('y-label-50').textContent  = formatRibuan(yMax * 0.5);
            document.getElementById('y-label-25').textContent  = formatRibuan(yMax * 0.25);
            document.getElementById('y-label-0').textContent   = "0";

            const xCoords = [40, 163, 287, 410, 533, 657, 780];
            let pathD = '';
            let pointsHTML = '';

            dailyAverages.forEach((val, index) => {
                const x = xCoords[index];
                const y = 200 - (val / yMax) * 180;

                if (index === 0) pathD += `M${x},${y} `;
                else             pathD += `L${x},${y} `;

                pointsHTML += `<circle cx="${x}" cy="${y}" r="5" fill="#4285f4" class="chart-point">
                                   <title>${formatRupiah(val)}</title>
                               </circle>`;
            });

            document.getElementById('chart-path').setAttribute('d', pathD);
            document.getElementById('chart-points').innerHTML = pointsHTML;
            document.getElementById('chart-title').innerText = `Average Price Trend (${categoryName})`;
        };

        const renderMonitoringGrid = (filteredProducts, categoryName) => {
            const container = document.getElementById("monitoring-grid-container");
            let htmlContent = "";
            let countIncrease = 0;
            let countDecrease = 0;

            filteredProducts.forEach(item => {
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

            container.innerHTML = htmlContent || '<p style="color:#888; padding: 20px;">Belum ada produk di kategori ini.</p>';
            
            document.getElementById("grid-title").innerText = `Product Price Monitoring (${categoryName})`;
            document.getElementById("avg-increase").innerText = countIncrease;
            document.getElementById("avg-decrease").innerText = countDecrease;
            document.getElementById("total-tracked").innerText = filteredProducts.length;
            document.getElementById("total-spending").innerText = formatRupiah(globalTotalSpending);
        };

        const setupFilters = () => {
            const buttons = document.querySelectorAll('.btn-filter');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.currentTarget; 
                    buttons.forEach(b => b.classList.remove('active'));
                    targetBtn.classList.add('active');
                    
                    const category = targetBtn.getAttribute('data-category');
                    
                    const filteredData = category === "All" 
                        ? globalProducts 
                        : globalProducts.filter(p => {
                            return p.category.trim().toLowerCase() === category.trim().toLowerCase();
                        });
                    
                    renderDynamicChart(filteredData, category);
                    renderMonitoringGrid(filteredData, category);
                });
            });
        };

        // Execution
        const insightsData = await fetchInsightsData();
        if (!insightsData) return;

        globalProducts = insightsData.products;
        globalTotalSpending = insightsData.totalSpending;

        renderSellerRecommendation(insightsData.topSeller);
        renderSmartPricing(globalProducts);
        
        renderDynamicChart(globalProducts, "All");
        renderMonitoringGrid(globalProducts, "All");
        setupFilters();
    }
});