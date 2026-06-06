const API_URL = 'http://localhost:3000/api';

let ordersData          = [];
let currentStatusFilter = 'All Status';

const tableBody   = document.getElementById('orders-table-body');
const searchInput = document.getElementById('order-search');

const loadOrders = async () => {
    try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`${API_URL}/orders`, {
            
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) { console.error(json.message); return; }
        ordersData = json.data.orders;
        filterData();
    } catch (err) {
        console.error('Gagal load orders:', err);
    }
};

function renderOrders(data) {
    tableBody.innerHTML = '';

    if (!data.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #757575;">
                    <i class="fas fa-box-open" style="font-size: 24px; margin-bottom: 10px;"></i><br>
                    No transactions yet.
                </td>
            </tr>
        `;
        updateStats();
        return;
    }

    data.forEach(order => {
        const row  = document.createElement('tr');
        let icon   = 'fa-check';
        const status = (order.status || '').toLowerCase();

        if (status === 'pending')    icon = 'fa-clock';
        if (status === 'shipped')    icon = 'fa-truck';
        if (status === 'processing') icon = 'fa-spinner';

        // Format tanggal dari created_at DB
        const date = order.created_at
            ? new Date(order.created_at).toLocaleDateString('id-ID')
            : '-';

        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${date}</td>
            <td>${order.item_names || '-'}</td>
            <td>Rp ${(order.total || 0).toLocaleString('id-ID')}</td>
            <td>
                <span class="status-badge ${status}">
                    <i class="fas ${icon}"></i> ${order.status}
                </span>
            </td>
            <td>${order.payment_method || '-'}</td>
            <td class="download-link" onclick="downloadInvoice('${order.id}')">
                <i class="fas fa-download"></i> Download
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateStats();
}

function updateStats() {
    document.getElementById('stat-total').textContent     = ordersData.length;
    document.getElementById('stat-pending').textContent   = ordersData.filter(o => o.status === 'pending').length;
    document.getElementById('stat-delivery').textContent  = ordersData.filter(o => o.status === 'shipped').length;
    document.getElementById('stat-completed').textContent = ordersData.filter(o => o.status === 'delivered').length;
}

function filterData() {
    const searchTerm     = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedStatus = currentStatusFilter;

    const filtered = ordersData.filter(order => {
        const matchesSearch  = (order.item_names || '').toLowerCase().includes(searchTerm)
                            || String(order.id).includes(searchTerm);
        const matchesStatus  = selectedStatus === 'All Status' || order.status === selectedStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    renderOrders(filtered);
}

function toggleFilterList(event) {
    event.stopPropagation();
    closeAllDropdowns();
    document.getElementById('filterList').classList.toggle('show');
}

function applyStatusFilter(status) {
    currentStatusFilter = status;
    document.getElementById('activeFilterLabel').innerText = status;
    closeAllDropdowns();
    filterData();
}

function closeAllDropdowns() {
    document.querySelectorAll('.status-dropdown-list').forEach(list => list.classList.remove('show'));
}

window.onclick = closeAllDropdowns;

function downloadInvoice(id) {
    alert('System is preparing your invoice: #' + id);
}

if (searchInput) searchInput.addEventListener('input', filterData);

loadOrders();
