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
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

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
            // --- DUMMY DATA LOGIC (COMMENTED, sudah tidak dipakai) ---
            /*
            if (!localStorage.getItem("currentSellerId")) localStorage.setItem("currentSellerId", "s1");
            const currentSellerId = localStorage.getItem("currentSellerId");
            if (typeof storesData !== 'undefined' && storesData[currentSellerId]) {
                const sellerData = storesData[currentSellerId];
                const headerEmail = document.querySelector(".user-profile .user-email");
                if (headerEmail) headerEmail.textContent = sellerData.name;
                if (profileName) profileName.textContent = "Alex Johnson";
                if (profileStore) profileStore.textContent = sellerData.name;
                if (inputs[0]) inputs[0].value = "Alex Johnson";
                if (inputs[1]) inputs[1].value = sellerData.name;
                if (inputs[2]) inputs[2].value = sellerData.email;
                if (inputs[3]) inputs[3].value = sellerData.phone;
                if (inputs[4]) inputs[4].value = sellerData.location;
            }
            */
        }
    }
    loadUserData();

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        toastMessage.textContent = message;
        if (type === 'error') {
            toast.classList.add('error');
            toastIcon.className = 'fas fa-exclamation-circle';
        } else {
            toast.classList.remove('error');
            toastIcon.className = 'fas fa-check-circle';
        }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
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
                input.removeAttribute('readonly');
                input.classList.add('editable');
            });
            inputs[0].focus();
            btnEditProfile.style.display = 'none';
            editActions.style.display = 'flex';
            editAvatarOverlay.style.display = 'flex';
        });
    }

    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', () => {
            inputs[0].value = tempUserData.fullName;
            inputs[1].value = tempUserData.storeName;
            inputs[2].value = tempUserData.email;
            inputs[3].value = tempUserData.phone;
            inputs[4].value = tempUserData.address;
            profileBigAvatar.src = tempUserData.avatar;
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
            profileName.textContent = newData.fullName;
            profileStore.textContent = newData.storeName;
            closeEditMode();
            showToast("Seller profile successfully updated! 🎉");
        });
    }

    function closeEditMode() {
        inputs.forEach(input => {
            input.setAttribute('readonly', true);
            input.classList.remove('editable');
        });
        btnEditProfile.style.display = 'inline-block';
        editActions.style.display = 'none';
        editAvatarOverlay.style.display = 'none';
    }

    if (editAvatarOverlay && avatarUpload) {
        editAvatarOverlay.addEventListener('click', () => avatarUpload.click());
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => profileBigAvatar.src = e.target.result;
                reader.readAsDataURL(file);
            }
        });
    }
});