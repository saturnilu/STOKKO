window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    if (tabName === 'profile') {
        document.getElementById('btn-profile').classList.add('active');
        document.getElementById('profile-content').classList.add('active');
    } else {
        document.getElementById('btn-sub').classList.add('active');
        document.getElementById('subscription-content').classList.add('active');
    }
};

window.handleRoleSwitch = function() {
    localStorage.setItem("currentRole", "buyer");
    window.location.href = "../../buyer/market/dashboard_buyer.html";
};

document.addEventListener("DOMContentLoaded", () => {
    const btnEditProfile = document.getElementById('btnEditProfile');
    const editActions = document.getElementById('editActions');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    const inputs = [
        document.getElementById('inputFullName'),
        document.getElementById('inputStoreName'),
        document.getElementById('inputEmail'),
        document.getElementById('inputPhone'),
        document.getElementById('inputAddress')
    ];
    const profileName = document.getElementById("profileName");
    const profileStore = document.getElementById("profileStore");
    const profileBigAvatar = document.getElementById('profileBigAvatar');
    const avatarUpload = document.getElementById('avatarUpload');
    const editAvatarOverlay = document.getElementById('editAvatarOverlay');
    let tempUserData = {};

    // BERUBAH: load data dari currentUser (hasil login) kalau belum pernah edit profil
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

    // Set Header Profile
    const headerUserName = document.querySelector(".user-profile .user-name");
    const headerUserEmail = document.querySelector(".user-profile .user-email");
    if (headerUserName) headerUserName.textContent = currentUser.username || currentUser.name || "Seller";
    if (headerUserEmail) headerUserEmail.textContent = currentUser.email || "";

    function loadUserData() {
        const savedData = JSON.parse(localStorage.getItem('stokko_seller_profile'));
        if (savedData) {
            if (inputs[0]) inputs[0].value = savedData.fullName;
            if (inputs[1]) inputs[1].value = savedData.storeName;
            if (inputs[2]) inputs[2].value = savedData.email;
            if (inputs[3]) inputs[3].value = savedData.phone;
            if (inputs[4]) inputs[4].value = savedData.address;
            if (profileName) profileName.textContent = savedData.fullName;
            if (profileStore) profileStore.textContent = savedData.storeName;
            if (savedData.avatar && profileBigAvatar) profileBigAvatar.src = savedData.avatar;
        } else {
            // BERUBAH: isi dari currentUser (data login) bukan storesData dummy
            if (inputs[0]) inputs[0].value = currentUser.username || '';
            if (inputs[1]) inputs[1].value = currentUser.username || '';
            if (inputs[2]) inputs[2].value = currentUser.email    || '';
            if (inputs[3]) inputs[3].value = currentUser.phone    || '';
            if (profileName)  profileName.textContent  = currentUser.username || '';
            if (profileStore) profileStore.textContent = currentUser.username || '';
        }
    }
    
    function applyPremiumUI() {
        try {
            const isPremium = !!(currentUser && (currentUser.isPremium || currentUser.is_premium === 1 || currentUser.is_premium === true));
            if (!isPremium) return;

            const btnPremiumTop = document.querySelector('.btn-premium-top');
            const goPremiumCard = document.querySelector('.go-premium-card');
            const btnUpgradeNow = document.querySelectorAll('.btn-upgrade-now, .btn-subscribe');

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
        const upgradeButtons = document.querySelectorAll('.btn-upgrade-now, .btn-premium-top, .btn-subscribe');
        
        upgradeButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                if (currentUser.isPremium || currentUser.is_premium === 1) {
                    showToast("Toko kamu sudah berstatus premium! 👑", "success");
                    return;
                }

                if (!confirm("Apakah kamu ingin mengaktifkan akun Seller Premium seharga Rp 108.900?")) return;

                const token = localStorage.getItem('token');
                try {
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
                        currentUser.isPremium = true;
                        currentUser.is_premium = 1;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        applyPremiumUI();
                        showToast("Upgrade Berhasil! Selamat datang di Premium 👑", "success");
                        
                        setTimeout(() => {
                            window.location.href = '../analytics/analytics_seller.html'; 
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
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', () => {
            tempUserData = {
                fullName: inputs[0].value,
                storeName: inputs[1].value,
                email: inputs[2].value,
                phone: inputs[3].value,
                address: inputs[4].value,
                avatar: profileBigAvatar.src
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
            if (inputs[0]) inputs[0].value = tempUserData.fullName;
            if (inputs[1]) inputs[1].value = tempUserData.storeName;
            if (inputs[2]) inputs[2].value = tempUserData.email;
            if (inputs[3]) inputs[3].value = tempUserData.phone;
            if (inputs[4]) inputs[4].value = tempUserData.address;
            if (profileBigAvatar) profileBigAvatar.src = tempUserData.avatar;
            closeEditMode();
        });
    }

    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', () => {
            const newData = {
                fullName: inputs[0].value,
                storeName: inputs[1].value,
                email: inputs[2].value,
                phone: inputs[3].value,
                address: inputs[4].value,
                avatar: profileBigAvatar.src
            };
            localStorage.setItem('stokko_seller_profile', JSON.stringify(newData));
            if (profileName) profileName.textContent = newData.fullName;
            if (profileStore) profileStore.textContent = newData.storeName;
            closeEditMode();
            showToast("Seller profile successfully updated! 🎉");
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

    if (editAvatarOverlay && avatarUpload) {
        editAvatarOverlay.addEventListener('click', () => avatarUpload.click());
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (profileBigAvatar) profileBigAvatar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});