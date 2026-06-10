const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'seller') {
        window.location.href = '../../screens/login/login_email.html';
        return;
    }

    const headerUserName = document.querySelector(".user-profile .user-name");
    const headerUserEmail = document.querySelector(".user-profile .user-email");
    if (headerUserName) headerUserName.textContent = currentUser.username || currentUser.name || "Seller";
    if (headerUserEmail) headerUserEmail.textContent = currentUser.email || "";

    const recentOrdersContainer = document.getElementById("recentOrdersContainer");
    const totalRevenueStat      = document.getElementById("totalRevenueStat");
    const totalOrdersStat       = document.getElementById("totalOrdersStat");
    const pendingOrdersStat     = document.getElementById("pendingOrdersStat");
    const activeListingsStat    = document.getElementById("activeListingsStat");
    const topProductsContainer  = document.getElementById("topProductsContainer");
    const totalViewsStat        = document.getElementById("totalViewsStat");

    function formatPrice(price) {
        return `Rp ${price.toLocaleString("id-ID")}`;
    }

    const apiFetch = async (url) => {
        const token = localStorage.getItem('token');
        return fetch(url, {
            
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    // BERUBAH: produk dari API bukan dummy_data
    const resProducts = await apiFetch(`${API_URL}/products/seller/my`);
    const jsonProducts = await resProducts.json();
    const sellerProducts = jsonProducts.data.products || [];

    if (activeListingsStat) {
        activeListingsStat.textContent = sellerProducts.length.toString();
    }

    // Total views dari semua produk
    const totalViews = sellerProducts.reduce((sum, p) => sum + (p.views || 0), 0);
    if (totalViewsStat) {
        totalViewsStat.textContent = totalViews.toLocaleString("id-ID");
    }

    // Top produk berdasarkan sales_count
    if (topProductsContainer && sellerProducts.length > 0) {
        topProductsContainer.innerHTML = "";
        const sorted = [...sellerProducts].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        sorted.slice(0, 2).forEach(product => {
            const pEl = document.createElement("div");
            pEl.classList.add("product-row");
            pEl.innerHTML = `
                <img src="${product.image_url || 'https://via.placeholder.com/40x40'}" alt="${product.name}">
                <div class="p-info">
                    <strong>${product.name}</strong>
                    <small>${product.sales_count || 0} sales • ${product.views || 0} views</small>
                </div>
                <span class="p-price">${formatPrice(product.price)}</span>
            `;
            topProductsContainer.appendChild(pEl);
        });
    }

    // BERUBAH: orders dari API bukan localStorage orderHistory
    const resOrders = await apiFetch(`${API_URL}/orders`);
    const jsonOrders = await resOrders.json();
    const sellerOrders = jsonOrders.data.orders || [];

    if (recentOrdersContainer) {
        recentOrdersContainer.innerHTML = "";
        if (!sellerOrders.length) {
            recentOrdersContainer.innerHTML = '<p style="color:#aaa;font-size:13px;">No orders yet.</p>';
        } else {
            sellerOrders.slice(0, 3).forEach(order => {
                const statusClass = order.status;
                const date = order.created_at
                    ? new Date(order.created_at).toLocaleDateString('id-ID')
                    : 'Just now';
                const orderEl = document.createElement("div");
                orderEl.classList.add("list-item");
                orderEl.innerHTML = `
                    <div class="info">
                        <strong>${order.item_display || '-'}</strong>
                        <small>Buyer • ${date}</small>
                    </div>
                    <div class="right">
                        <span>${formatPrice(order.seller_total || 0)}</span>
                        <span class="status ${statusClass}">${order.status}</span>
                    </div>
                `;
                recentOrdersContainer.appendChild(orderEl);
            });
        }
    }

    // Hitung stats dari orders
    let totalRevenue = 0;
    let pendingCount = 0;
    sellerOrders.forEach(order => {
        if (order.status !== 'cancelled') totalRevenue += Number(order.seller_total || 0);
        if (order.status === 'pending') pendingCount++;
    });

    if (totalRevenueStat)  totalRevenueStat.textContent  = formatPrice(totalRevenue);
    if (totalOrdersStat)   totalOrdersStat.textContent   = sellerOrders.length.toString();
    if (pendingOrdersStat) pendingOrdersStat.textContent = `${pendingCount} pending`;
});