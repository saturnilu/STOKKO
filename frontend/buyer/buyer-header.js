/**
 * buyer-header.js
 * Shared script — dijalankan di semua halaman buyer.
 * Mengisi header (nama, email, avatar) dari localStorage currentUser
 * yang disimpan oleh backend saat proses login.
 */
(function () {
    const API_URL = 'http://localhost:3000/api';
    const DEFAULT_AVATAR = '../images/profile1.png';

    // Ambil data user dari localStorage (diisi saat login)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Jika tidak ada sesi login sama sekali, redirect ke login
    if (!currentUser || !currentUser.id) {
        // Biarkan halaman load; redirect hanya kalau memang perlu
        // (beberapa halaman publik tidak butuh login)
    }

    function applyHeader(user) {
        // Nama — pakai username atau name
        const displayName = user.username || user.name || 'User';
        const displayEmail = user.email || '';
        const displayAvatar = user.avatar_url || user.avatar || null;

        // Isi semua elemen .user-name di header
        document.querySelectorAll('.main-header .user-name').forEach(el => {
            el.textContent = displayName;
        });

        // Isi semua elemen .user-email di header
        document.querySelectorAll('.main-header .user-email').forEach(el => {
            el.textContent = displayEmail;
        });

        // Ganti avatar jika ada URL dari server
        if (displayAvatar) {
            document.querySelectorAll('.main-header .avatar').forEach(el => {
                el.src = displayAvatar;
                el.onerror = function () { this.src = DEFAULT_AVATAR; };
            });
        }
    }

    // Terapkan dari localStorage terlebih dahulu (cepat, tidak perlu tunggu fetch)
    if (currentUser) {
        applyHeader(currentUser);
    }

    // Lalu refresh dari API untuk memastikan data terbaru (opsional, non-blocking)
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(json => {
            if (!json) return;
            // Dukung berbagai format response: { user } atau { data: { user } }
            const freshUser = json.user || json.data?.user || null;
            if (!freshUser) return;

            // Update localStorage agar konsisten
            const merged = { ...currentUser, ...freshUser };
            localStorage.setItem('currentUser', JSON.stringify(merged));

            // Terapkan ke header
            applyHeader(merged);
        })
        .catch(() => {
            // Gagal fetch → tetap pakai data localStorage, tidak perlu error
        });
    }
})();
