const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'seller') {
        window.location.href = '../../screens/login/login_email.html';
        return;
    }

    const headerName  = document.querySelector(".user-profile .user-name");
    const headerEmail = document.querySelector(".user-profile .user-email");
    if (headerName)  headerName.textContent  = currentUser.username;
    if (headerEmail) headerEmail.textContent = currentUser.email;

    let notifications = [];

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
            notifications = json.data.notifications;
            renderNotifications();
        } catch (err) {
            console.error('Gagal load notifikasi:', err);
        }
    };

    function getNotifStyle(type) {
        const styles = {
            new_order:    { icon: 'fas fa-box',                themeClass: 'blue-theme'  },
            order_update: { icon: 'fas fa-check-circle',       themeClass: 'green-theme' },
            low_stock:    { icon: 'fas fa-exclamation-triangle',themeClass: 'red-theme'  },
            price_alert:  { icon: 'fas fa-tag',                themeClass: 'yellow-text' },
            system:       { icon: 'fas fa-store',              themeClass: 'blue-theme'  },
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
        const container   = document.getElementById('notification-container');
        const counterText = document.getElementById('unread-counter');
        if (!container || !counterText) return;

        let unreadCount = 0;
        let htmlContent = '';

        if (!notifications.length) {
            container.innerHTML = `<p style="text-align:center; color:#888; margin-top:20px;">No notifications yet.</p>`;
            counterText.textContent = `You have 0 unread notifications`;
            return;
        }

        notifications.forEach(notif => {
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

    window.deleteNotif = async (id) => {
        await apiFetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
        notifications = notifications.filter(n => n.id !== id);
        renderNotifications();
    };

    const btnMarkAll = document.querySelector('.btn-mark-all');
    if (btnMarkAll) {
        btnMarkAll.addEventListener('click', async () => {
            await apiFetch(`${API_URL}/notifications/read-all`, { method: 'PATCH' });
            notifications = notifications.map(n => ({ ...n, is_read: true }));
            renderNotifications();
        });
    }

    await loadNotifications();
});
