document.addEventListener('DOMContentLoaded', () => {
    const btnEditProfile = document.getElementById('btnEditProfile');
    const editActions = document.getElementById('editActions');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    
    const inputs = [
        document.getElementById('inputName'),
        document.getElementById('inputEmail'),
        document.getElementById('inputPhone'),
        document.getElementById('inputAddress')
    ];

    const mainProfileName = document.getElementById('mainProfileName');
    const avatarUpload = document.getElementById('avatarUpload');
    const editAvatarOverlay = document.getElementById('editAvatarOverlay');
    const mainProfileAvatar = document.getElementById('mainProfileAvatar');

    let tempUserData = {};
    let currentUser = {};

    try {
        const _raw = localStorage.getItem('currentUser');
        if (_raw) currentUser = JSON.parse(_raw) || {};
    } catch (err) {
        console.warn('Failed to parse currentUser from localStorage', err);
        currentUser = {};
    }

    function loadUserData() {
        const savedData = JSON.parse(localStorage.getItem('stokko_buyer_profile'));

        if (savedData) {
            inputs[0].value = savedData.name;
            inputs[1].value = savedData.email;
            inputs[2].value = savedData.phone;
            inputs[3].value = savedData.address;
            mainProfileName.textContent = savedData.name;

            if (savedData.avatar) {
                mainProfileAvatar.src = savedData.avatar;
            }
        } else {
            if (inputs[0]) inputs[0].value = currentUser.username || currentUser.name || '';
            if (inputs[1]) inputs[1].value = currentUser.email    || '';
            if (inputs[2]) inputs[2].value = currentUser.phone    || '';
            if (mainProfileName) mainProfileName.textContent = currentUser.username || currentUser.name || '';
        }
    }

    function applyPremiumUI() {
        try {
            const isPremium = !!(currentUser && (currentUser.isPremium || currentUser.is_premium === 1 || currentUser.is_premium === true));
            if (!isPremium) return;

            const btnPremiumTop = document.querySelector('.btn-premium-top');
            const goPremiumCard = document.querySelector('.go-premium-card');
            const btnUpgradeNow = document.querySelectorAll('.btn-upgrade-now');

            if (btnUpgradeNow && btnUpgradeNow.forEach) {
                btnUpgradeNow.forEach(btn => { if (btn && btn.style) btn.style.display = 'none'; });
            }

            if (btnPremiumTop && btnPremiumTop.style) btnPremiumTop.style.display = 'none';
            if (goPremiumCard && goPremiumCard.style) goPremiumCard.style.display = 'none';
        } catch (err) {
            console.error('applyPremiumUI error:', err);
        }
    }

    async function fetchSubscriptionStatus() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:3000/api/subscriptions/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) return;
            const json = await res.json();
            
            if (json.data && json.data.isPremium) {
                currentUser.isPremium = true;
                currentUser.is_premium = 1; 
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                applyPremiumUI();
            }
        } catch (err) {
            console.warn('fetchSubscriptionStatus error:', err);
        }
    }

    const setupSubscriptionActions = () => {
        const upgradeButtons = document.querySelectorAll('.btn-upgrade-now, .btn-premium-top');
        
        upgradeButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                if (currentUser.isPremium || currentUser.is_premium === 1) {
                    showToast("Kamu sudah berstatus premium! 👑", "success");
                    return;
                }

                if (!confirm("Apakah kamu ingin mengaktifkan akun Premium STOKKO seharga Rp 108.900?")) return;

                const token = localStorage.getItem('token');
                try {
                    // Panggil API checkout milik kalian
                    const res = await fetch('http://localhost:3000/api/subscriptions/checkout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            plan: 'monthly',
                            price: 108900,
                            payment_method: 'qris'
                        })
                    });

                    const json = await res.json();

                    if (res.ok) {
                        // Update status di memori browser secara instan
                        currentUser.isPremium = true;
                        currentUser.is_premium = 1;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        applyPremiumUI();
                        showToast("Upgrade Berhasil! Selamat datang di Premium", "success");
                        
                        setTimeout(() => {
                            window.location.href = '../analytics/priceinsight.html';
                        }, 2000);
                    } else {
                        showToast(json.message || "Gagal memproses subscription.", "error");
                    }
                } catch (err) {
                    console.error("Subscription Error:", err);
                    showToast("Terjadi kesalahan koneksi server.", "error");
                }
            });
        });
    };

    loadUserData();
    fetchSubscriptionStatus();
    applyPremiumUI();
    setupSubscriptionActions();

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        if (toastMessage) toastMessage.textContent = message;
        
        if (toast) {
            if (type === 'error') {
                toast.classList.add('error');
                if (toastIcon) toastIcon.className = 'fas fa-exclamation-circle';
            } else {
                toast.classList.remove('error');
                if (toastIcon) toastIcon.className = 'fas fa-check-circle';
            }
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 3000);
        }
    }

    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', () => {
            tempUserData = {
                name: inputs[0].value,
                email: inputs[1].value,
                phone: inputs[2].value,
                address: inputs[3].value,
                avatar: mainProfileAvatar.src
            };

            inputs.forEach(input => {
                if (input) {
                    input.removeAttribute('readonly');
                    input.classList.add('editable');
                }
            });

            if (inputs[0]) inputs[0].focus();
            btnEditProfile.style.display = 'none';
            if (editActions) editActions.style.display = 'flex';
            if (editAvatarOverlay) editAvatarOverlay.style.display = 'flex';
        });
    }

    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', () => {
            if (inputs[0]) inputs[0].value = tempUserData.name;
            if (inputs[1]) inputs[1].value = tempUserData.email;
            if (inputs[2]) inputs[2].value = tempUserData.phone;
            if (inputs[3]) inputs[3].value = tempUserData.address;
            if (mainProfileAvatar) mainProfileAvatar.src = tempUserData.avatar;
            closeEditMode();
        });
    }

    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', () => {
            const newData = {
                name: inputs[0].value,
                email: inputs[1].value,
                phone: inputs[2].value,
                address: inputs[3].value,
                avatar: mainProfileAvatar.src
            };

            localStorage.setItem('stokko_buyer_profile', JSON.stringify(newData));
            if (mainProfileName) mainProfileName.textContent = newData.name;
            closeEditMode();
            showToast("Profile successfully updated! 🎉", "success");
        });
    }

    function closeEditMode() {
        inputs.forEach(input => {
            if (input) {
                input.setAttribute('readonly', true);
                input.classList.remove('editable');
            }
        });
        if (btnEditProfile) btnEditProfile.style.display = 'inline-block';
        if (editActions) editActions.style.display = 'none';
        if (editAvatarOverlay) editAvatarOverlay.style.display = 'none';
    }

    if (avatarUpload) {
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (mainProfileAvatar) mainProfileAvatar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => { btn.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(content => { content.classList.remove('active'); });

    if (tabName === 'profile') {
        const btnProf = document.getElementById('btn-profile');
        const contProf = document.getElementById('profile-content');
        if (btnProf) btnProf.classList.add('active');
        if (contProf) contProf.classList.add('active');
    } else {
        const btnSub = document.getElementById('btn-sub');
        const contSub = document.getElementById('subscription-content');
        if (btnSub) btnSub.classList.add('active');
        if (contSub) contSub.classList.add('active');
    }
}

function handleRoleSwitch() {
    if (confirm("Are you sure you want to switch to Seller Role?")) {
        window.location.href = '../../seller/dashboard/dashboard_seller.html';
    }
}