document.addEventListener("DOMContentLoaded", () => {
    
    // 1. total orderHistory
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    const totalSpending = orderHistory.reduce((sum, order) => sum + order.price, 0);

    const localProducts = productsData.map(p => {
        const currentPrice = p.price; // Harga hari ini (history index ke-6)
        const previousPrice = p.history[5]; // Harga kemarin
  
        // Hitung rata-rata perubahan per hari selama 6 hari terakhir
        let totalChange = 0;
        for(let i = 1; i < 7; i++) {
            totalChange += (p.history[i] - p.history[i-1]);
        }
        let avgDailyChange = totalChange / 6;
        
        // Prediksi max bwt 7 hari ke depan
        let predicted7DaysChange = avgDailyChange * 7;
        let predictedPercentage = (predicted7DaysChange / currentPrice) * 100;
        
        let isSmartPricing = false;
        let smartDesc = "";
        let message = "Prices are currently stable.";

        // Logika Smart Pricing: Kalau diprediksi naik/turun tajam (> 1.5%)
        if (predictedPercentage > 1.5) {
            isSmartPricing = true;
            smartDesc = `Forecast: Price expected to rise by ${predictedPercentage.toFixed(1)}% in the next 7 days based on data.`;
            message = "Price surge detected - Consider buying now to avoid paying more!";
        } else if (predictedPercentage < -1.5) {
            isSmartPricing = true;
            smartDesc = `Forecast: Price dropping! Expected to decrease by ${Math.abs(predictedPercentage).toFixed(1)}% in the next 7 days.`;
            message = "Good time to stock up and save money!";
        }

        return {
            ...p,
            currentPrice,
            previousPrice,
            predictedPercentage, 
            message,
            isSmartPricing,
            smartDesc
        };
    });

    let currentProductId = "All";

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    const formatRibuan = (angka) => {
        if(angka >= 1000) return (angka / 1000).toFixed(1) + 'k';
        return angka;
    };

    const calculateTrend = (current, previous) => {
        const diff = current - previous;
        const percentage = (diff / previous) * 100;
        return {
            value: percentage,
            formatted: (percentage > 0 ? '+' : '') + percentage.toFixed(2) + '%',
            isUp: percentage > 0, // Positif berarti naik (Merah)
            isDown: percentage < 0 // Negatif berarti turun (Hijau)
        };
    };

    const renderSellerRecommendation = () => {
        let topSellerId = Object.keys(storesData)[0];
        let maxSales = -1;

        for (const [id, seller] of Object.entries(storesData)) {
            if (seller.sales > maxSales) {
                maxSales = seller.sales;
                topSellerId = id;
            }
        }

        const bestSeller = storesData[topSellerId];
        
        document.getElementById('seller-rec-desc').innerHTML = `Based on your order history and market trends, we recommend <strong>"${bestSeller.name}"</strong> - they have ${bestSeller.sales} total successful transactions and competitive pricing.`;
        
        document.getElementById('btn-seller-rec').addEventListener('click', () => {
            localStorage.setItem('selectedSellerId', topSellerId);
            window.location.href = '../market/seller_profile.html';
        });
    };

    const renderSmartPricing = () => {
        const container = document.getElementById("smart-pricing-container");
        const smartItems = localProducts.filter(item => item.isSmartPricing);
        
        let htmlContent = "";
        smartItems.forEach(item => {
            const isUp = item.predictedPercentage > 0;
            const colorClass = isUp ? "text-red" : "text-green";
            const formattedTrend = (isUp ? '+' : '') + item.predictedPercentage.toFixed(2) + '%';
            
            htmlContent += `
                <div class="smart-item">
                    <div class="smart-item-left">
                        <h4>${item.name}</h4>
                        <p class="desc">${item.smartDesc}</p>
                        <p class="price">Current price: ${formatRupiah(item.currentPrice)}</p>
                    </div>
                    <div class="smart-item-right ${colorClass}">${formattedTrend}</div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;
    };

    const renderDynamicChart = (productId) => {
        const filteredData = productId === "All" ? localProducts : localProducts.filter(item => item.id === productId);
        
        let dailyAverages = [0, 0, 0, 0, 0, 0, 0];
        if (filteredData.length > 0) {
            for (let day = 0; day < 7; day++) {
                let sum = 0;
                filteredData.forEach(product => { sum += product.history[day]; });
                dailyAverages[day] = sum / filteredData.length;
            }
        }

        const maxVal = Math.max(...dailyAverages);
        const yMax = Math.ceil((maxVal * 1.2) / 5000) * 5000 || 5000;

        document.getElementById('y-label-max').textContent = formatRibuan(yMax);
        document.getElementById('y-label-75').textContent = formatRibuan(yMax * 0.75);
        document.getElementById('y-label-50').textContent = formatRibuan(yMax * 0.5);
        document.getElementById('y-label-25').textContent = formatRibuan(yMax * 0.25);
        document.getElementById('y-label-0').textContent = "0";

        const xCoords = [40, 163, 287, 410, 533, 657, 780];
        let pathD = "";
        let pointsHTML = "";

        dailyAverages.forEach((val, index) => {
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
        
        const chartTitle = productId === "All" ? "All Products" : filteredData[0].name;
        document.getElementById('chart-title').innerText = `Average Price Trend (${chartTitle})`;
    };

    const renderMonitoringGrid = (productId) => {
        const container = document.getElementById("monitoring-grid-container");
        const filteredData = productId === "All" ? localProducts : localProducts.filter(item => item.id === productId);
        
        let htmlContent = "";
        let countIncrease = 0;
        let countDecrease = 0;

        filteredData.forEach(item => {
            const trend = calculateTrend(item.currentPrice, item.previousPrice);
            const isIncrease = trend.isUp;
            const isDecrease = trend.isDown;
            
            if (isIncrease) countIncrease++;
            else if (isDecrease) countDecrease++;

            const boxBorder = isIncrease ? "border-red-box" : "border-green-box";
            const textColor = isIncrease ? "text-red" : "text-green";
            const iconArrow = isIncrease ? "fa-arrow-up" : "fa-arrow-down";
            const borderTop = isIncrease ? "border-top-red" : "border-top-green";
          
            const iconStyle = "display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; margin-right: 8px; font-size: 12px;";
            const iconRedBg = `style="${iconStyle} background: #fee2e2; color: #ef4444;"`;
            const iconGreenBg = `style="${iconStyle} background: #dcfce7; color: #22c55e;"`;

            const footerIcon = isIncrease 
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
        
        const gridTitle = productId === "All" ? "All" : filteredData[0].name;
        document.getElementById("grid-title").innerText = `Product Price Monitoring (${gridTitle})`;
        
        document.getElementById("avg-increase").innerText = countIncrease;
        document.getElementById("avg-decrease").innerText = countDecrease;
        document.getElementById("total-tracked").innerText = filteredData.length;
        document.getElementById("total-spending").innerText = formatRupiah(totalSpending); // Nembak dari orderHistory!
    };

    const setupFilters = () => {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                currentProductId = e.target.getAttribute('data-product');
                renderDynamicChart(currentProductId);
                renderMonitoringGrid(currentProductId);
            });
        });
    };

    renderSellerRecommendation();
    renderSmartPricing();
    renderDynamicChart(currentProductId);
    renderMonitoringGrid(currentProductId);
    setupFilters();
});