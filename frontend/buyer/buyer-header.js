(function () {
    const API_URL = 'http://localhost:3000/api';
    const DEFAULT_AVATAR = '../images/profile1.png';

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!currentUser || !currentUser.id) {
        // Biarkan halaman load; redirect hanya kalau memang perlu
        // (beberapa halaman publik tidak butuh login)
    }

    function applyHeader(user) {
        const displayName = user.username || user.name || 'User';
        const displayEmail = user.email || '';
        const displayAvatar = user.avatar_url || user.avatar || null;

        document.querySelectorAll('.main-header .user-name').forEach(el => {
            el.textContent = displayName;
        });

        document.querySelectorAll('.main-header .user-email').forEach(el => {
            el.textContent = displayEmail;
        });

        if (displayAvatar) {
            document.querySelectorAll('.main-header .avatar').forEach(el => {
                el.src = displayAvatar;
                el.onerror = function () { this.src = DEFAULT_AVATAR; };
            });
        }
    }

    function applyPremiumState(user) {
        const isPremium = !!(user && (user.isPremium || user.is_premium === 1 || user.is_premium === true));

        if (isPremium) {
            document.querySelectorAll('.btn-premium-top').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.go-premium-card').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.btn-upgrade-now').forEach(el => el.style.display = 'none');
        }
    }

    if (currentUser) {
        applyHeader(currentUser);
        applyPremiumState(currentUser);
    }

    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(json => {
            if (!json) return;
            const freshUser = json.user || json.data?.user || null;
            if (!freshUser) return;

            const merged = { ...currentUser, ...freshUser };
            localStorage.setItem('currentUser', JSON.stringify(merged));

            applyHeader(merged);
            applyPremiumState(merged);
        })
        .catch(() => {
        });
    }
})();