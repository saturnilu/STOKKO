const API_URL = 'http://localhost:3000/api';

let notificationsData = [];

const container  = document.getElementById('notification-container');
const counterText = document.getElementById('unread-counter');
const btnMarkAll  = document.querySelector('.btn-mark-all');

const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    });
};

const loadNotifications = async () => {
    try {
        const res  = await apiFetch(`${API_URL}/notifications`);
        const json = await res.json();
        if (!res.ok) { console.error(json.message); return; }
        notificationsData = json.data.notifications;
        renderNotifications();
    } catch (err) {
        console.error('Gagal load notifikasi:', err);
    }
};

function getNotifStyle(type) {
    const styles = {
        new_order:    { icon: 'fas fa-box',                themeClass: 'blue-theme'  },
        order_update: { icon: 'fas fa-truck',              themeClass: 'blue-theme'  },
        low_stock:    { icon: 'fas fa-exclamation-triangle',themeClass: 'red-theme'  },
        price_alert:  { icon: 'fas fa-tag',                themeClass: 'yellow-text' },
        system:       { icon: 'fas fa-bell',               themeClass: 'purple-text' },
    };
    return styles[type] || { icon: 'fas fa-bell', themeClass: 'blue-theme' };
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `about ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function renderNotifications() {
    let unreadCount = 0;
    let htmlContent = '';

    if (!notificationsData.length) {
        container.innerHTML = `<p style="text-align:center; color:#888; margin-top:20px;">No notifications found.</p>`;
        counterText.textContent = `You have 0 unread notifications`;
        return;
    }

    notificationsData.forEach(notif => {
        const { icon, themeClass } = getNotifStyle(notif.type);
        const unreadClass = notif.is_read ? '' : 'unread';
        const badgeHtml   = notif.is_read ? '' : '<span class="badge-new">New</span>';
        if (!notif.is_read) unreadCount++;

        htmlContent += `
            <div class="notif-card ${unreadClass} ${themeClass}">
                <div class="notif-icon"><i class="${icon}"></i></div>
                <div class="notif-details">
                    <div class="notif-title-row">
                        <h3>${notif.title}</h3>
                        ${badgeHtml}
                    </div>
                    <p>${notif.message}</p>
                    <span class="notif-time">${timeAgo(notif.created_at)}</span>
                </div>
                <button class="btn-delete" onclick="deleteNotif(${notif.id})">
                    <i class="far fa-trash-alt"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
    counterText.textContent = `You have ${unreadCount} unread notifications`;
}

async function deleteNotif(id) {
    await apiFetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
    notificationsData = notificationsData.filter(n => n.id !== id);
    renderNotifications();
}

btnMarkAll.addEventListener('click', async () => {
    await apiFetch(`${API_URL}/notifications/read-all`, { method: 'PATCH' });
    notificationsData = notificationsData.map(n => ({ ...n, is_read: true }));
    renderNotifications();
});

loadNotifications();
