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

    // HEADER ELEMENTS
    // const headerUserName = document.querySelector('.main-header .user-name');
    // const headerUserEmail = document.querySelector('.main-header .user-email');

    const avatarUpload = document.getElementById('avatarUpload');
    const editAvatarOverlay = document.getElementById('editAvatarOverlay');
    const mainProfileAvatar = document.getElementById('mainProfileAvatar');

    // const headerAvatar = document.querySelector('.main-header .avatar');

    let tempUserData = {};

    // BERUBAH: load data dari currentUser (hasil login) kalau belum pernah edit profil
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

    function loadUserData() {
        const savedData = JSON.parse(localStorage.getItem('stokko_buyer_profile'));

        if (savedData) {
            inputs[0].value = savedData.name;
            inputs[1].value = savedData.email;
            inputs[2].value = savedData.phone;
            inputs[3].value = savedData.address;

            mainProfileName.textContent = savedData.name;

            // HEADER UPDATE DISABLED
            // if (headerUserName) headerUserName.textContent = savedData.name;
            // if (headerUserEmail) headerUserEmail.textContent = savedData.email;

            if (savedData.avatar) {
                mainProfileAvatar.src = savedData.avatar;

                // HEADER AVATAR UPDATE DISABLED
                // if (headerAvatar) headerAvatar.src = savedData.avatar;
            }
        } else {
            // BERUBAH: isi dari currentUser bukan dummy data
            if (inputs[0]) inputs[0].value = currentUser.username || '';
            if (inputs[1]) inputs[1].value = currentUser.email    || '';
            if (inputs[2]) inputs[2].value = currentUser.phone    || '';
            if (mainProfileName) mainProfileName.textContent = currentUser.username || '';
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

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    btnEditProfile.addEventListener('click', () => {
        tempUserData = {
            name: inputs[0].value,
            email: inputs[1].value,
            phone: inputs[2].value,
            address: inputs[3].value,
            avatar: mainProfileAvatar.src
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

    btnCancelEdit.addEventListener('click', () => {
        inputs[0].value = tempUserData.name;
        inputs[1].value = tempUserData.email;
        inputs[2].value = tempUserData.phone;
        inputs[3].value = tempUserData.address;
        
        mainProfileAvatar.src = tempUserData.avatar;

        // HEADER AVATAR RESET DISABLED
        // if (headerAvatar) headerAvatar.src = tempUserData.avatar;

        closeEditMode();
    });

    btnSaveProfile.addEventListener('click', () => {
        const newData = {
            name: inputs[0].value,
            email: inputs[1].value,
            phone: inputs[2].value,
            address: inputs[3].value,
            avatar: mainProfileAvatar.src
        };

        localStorage.setItem('stokko_buyer_profile', JSON.stringify(newData));

        mainProfileName.textContent = newData.name;

        // HEADER TEXT UPDATE DISABLED
        // if (headerUserName) headerUserName.textContent = newData.name;
        // if (headerUserEmail) headerUserEmail.textContent = newData.email;

        closeEditMode();

        showToast("Profile successfully updated! 🎉");
    });

    function closeEditMode() {
        inputs.forEach(input => {
            input.setAttribute('readonly', true);
            input.classList.remove('editable');
        });
        
        btnEditProfile.style.display = 'inline-block';
        editActions.style.display = 'none';
        editAvatarOverlay.style.display = 'none';
    }

    avatarUpload.addEventListener('change', function() {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                mainProfileAvatar.src = e.target.result;

                // HEADER AVATAR LIVE UPDATE DISABLED
                // if (headerAvatar) headerAvatar.src = e.target.result;
            };

            reader.readAsDataURL(file);
        }
    });

});

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'profile') {
        document.getElementById('btn-profile').classList.add('active');
        document.getElementById('profile-content').classList.add('active');
    } else {
        document.getElementById('btn-sub').classList.add('active');
        document.getElementById('subscription-content').classList.add('active');
    }
}

function handleRoleSwitch() {
    if (confirm("Are you sure you want to switch to Seller Role?")) {
        window.location.href = '../../seller/dashboard/dashboard_seller.html';
    }
}