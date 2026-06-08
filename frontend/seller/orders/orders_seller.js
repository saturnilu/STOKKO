const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'seller') {
        window.location.href = '../../screens/login/login_email.html';
        return;
    }

    // Tampilkan nama dan email store di header
    const headerUserName = document.querySelector(".user-profile .user-name");
    const headerUserEmail = document.querySelector(".user-profile .user-email");
    if (headerUserName) headerUserName.textContent = currentUser.username || currentUser.name || "Seller";
    if (headerUserEmail) headerUserEmail.textContent = currentUser.email || "";

    let sellerOrders        = [];
    let currentFilterStatus = 'all';
    let currentSearchQuery  = '';

    const apiFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        return fetch(url, {
            ...options,
            
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
        });
    };

    const loadOrders = async () => {
        try {
            const res  = await apiFetch(`${API_URL}/orders`);
            const json = await res.json();
            if (!res.ok) { console.error(json.message); return; }
            sellerOrders = json.data.orders;
            renderOrders();
        } catch (err) {
            console.error('Gagal load orders:', err);
        }
    };

    window.renderOrders = function () {
        const tbody = document.getElementById('orderTableBody');
        if (!tbody) return;

        let countPending   = 0, countDelivery = 0, countCompleted = 0, totalRevenue = 0;

        sellerOrders.forEach(order => {
            if (order.status === 'pending')   countPending++;
            if (order.status === 'shipped')   countDelivery++;
            if (order.status === 'delivered') countCompleted++;
            if (order.status !== 'cancelled') totalRevenue += Number(order.seller_total || 0);
        });

        const filtered = sellerOrders.filter(order => {
            const matchStatus = currentFilterStatus === 'all' || order.status === currentFilterStatus;
            const matchSearch = (order.item_display || '').toLowerCase().includes(currentSearchQuery.toLowerCase());
            return matchStatus && matchSearch;
        });

        document.getElementById('sumTotal').innerText   = sellerOrders.length;
        document.getElementById('sumPending').innerText = countPending;
        document.getElementById('sumDelivery').innerText   = countDelivery;
        document.getElementById('sumCompleted').innerText  = countCompleted;
        document.getElementById('sumRevenue').innerText    = `Rp ${totalRevenue.toLocaleString('id-ID')}`;

        if (!filtered.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;">No Order yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(order => {
            const date = order.created_at
                ? new Date(order.created_at).toLocaleDateString('id-ID')
                : '-';
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td class="font-bold">${order.item_display || '-'}</td>
                    <td>${order.buyer_name || 'Buyer'}</td>
                    <td>Rp ${(order.seller_total || 0).toLocaleString('id-ID')}</td>
                    <td>${date}</td>
                    <td>
                        <div class="status-select-container" style="position:relative;">
                            <div class="status-pill ${order.status}" onclick="toggleTableDropdown(this, event)">
                                <span class="status-text">${order.status}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="status-dropdown-list pop-up-list">
                                <li onclick="changeRowStatus('${order.id}', 'pending')">pending</li>
                                <li onclick="changeRowStatus('${order.id}', 'processing')">processing</li>
                                <li onclick="changeRowStatus('${order.id}', 'shipped')">shipped</li>
                                <li onclick="changeRowStatus('${order.id}', 'delivered')">delivered</li>
                                <li onclick="changeRowStatus('${order.id}', 'cancelled')">cancelled</li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.changeRowStatus = async (orderId, newStatus) => {
        try {
            const res  = await apiFetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok) { alert(data.message || 'Gagal update status.'); return; }

            // Update lokal dulu biar tidak perlu refetch
            const idx = sellerOrders.findIndex(o => String(o.id) === String(orderId));
            if (idx > -1) sellerOrders[idx].status = newStatus;
            closeAllDropdowns();
            renderOrders();
        } catch (err) {
            alert('Tidak bisa terhubung ke server.');
        }
    };

    window.toggleFilterList = function (event) {
        event.stopPropagation();
        closeAllDropdowns();
        document.getElementById('filterList').classList.toggle('show');
    };

    window.applyStatusFilter = function (status) {
        const label = document.getElementById('activeFilterLabel');
        label.innerText = status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1);
        currentFilterStatus = status;
        closeAllDropdowns();
        renderOrders();
    };

    window.filterBySearch = function () {
        currentSearchQuery = document.getElementById("searchInput").value;
        renderOrders();
    };

    window.toggleTableDropdown = function (element, event) {
        event.stopPropagation();
        const currentList = element.nextElementSibling;
        const isOpen      = currentList.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) currentList.classList.add('show');
    };

    window.closeAllDropdowns = function () {
        document.querySelectorAll('.status-dropdown-list').forEach(list => list.classList.remove('show'));
    };

    window.onclick = closeAllDropdowns;

    await loadOrders();
});
