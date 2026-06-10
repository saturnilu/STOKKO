const API_URL = 'http://localhost:3000/api';
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(toastContainer);
    }
});

function selectRole(role) {
    localStorage.setItem('userRole', role);
    window.location.href = '../login/login_number.html';
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    toast.style.cssText = 'background: #f37878; color: white; padding: 15px 25px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: bold; transition: opacity 0.5s;';
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function markError(input) {
    input.classList.add('input-error');
    if(input.parentElement) input.parentElement.classList.add('invalid');
}

function redirectUser() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const rememberCheckbox = document.getElementById('remember');

    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    const allInputs = document.querySelectorAll('.login-form input:not([type="checkbox"])');
    let allValid = true;
    allInputs.forEach(input => {
        if (input.value.trim() === "") {
            markError(input);
            allValid = false;
        }
    });

    if (!allValid) {
        showToast('Oops, please fill in all the details first!'); 
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
        markError(emailInput);
        showToast('Invalid email format, please check again!');
        return;
    }

    const phoneRegex = /^[0-9]{10,13}$/;
    if (phoneInput && !phoneRegex.test(phoneInput.value.trim())) {
        markError(phoneInput);
        showToast('Invalid phone number, please enter 10-13 digits!');
        return;
    }

    if (passwordInput && passwordInput.value.length < 8) {
        markError(passwordInput);
        showToast('Password must be at least 8 characters for security!');
        return;
    }

    if (confirmPasswordInput && confirmPasswordInput.value !== passwordInput.value) {
        markError(confirmPasswordInput);
        markError(passwordInput);
        showToast('Password and Confirm Password do not match!');
        return;
    }

    if (rememberCheckbox && !rememberCheckbox.checked) {
        showToast('Please check "Remember me" first!');
        return;
    }

    // CEK: halaman register atau login?
    const usernameInput   = document.getElementById('username');
    const confirmInput    = document.getElementById('confirm_password');

    if (usernameInput && confirmInput) {
        // INI HALAMAN REGISTER — kirim ke API
        const role = localStorage.getItem('userRole') || 'buyer';
        fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username:         usernameInput.value.trim(),
                email:            emailInput.value.trim(),
                phone:            phoneInput.value.trim(),
                password:         passwordInput.value,
                confirm_password: confirmPasswordInput.value,
                role,
            }),
        })
        .then(r => r.json())
        .then(data => {
            if (data.user) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                executeRedirect();
            } else {
                showToast(data.message || 'Registrasi gagal.');
            }
        })
        .catch(() => showToast('Tidak bisa terhubung ke server.'));
        return;
    }

    // INI HALAMAN LOGIN — kirim ke API
    const identifier = emailInput
        ? emailInput.value.trim()
        : phoneInput.value.trim();

    fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identifier,
            password: passwordInput.value,
        }),
    })
    .then(r => r.json())
    .then(data => {
        if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            executeRedirect();
        } else {
            showToast(data.message || 'Login gagal.');
        }
    })
    .catch(() => showToast('Tidak bisa terhubung ke server.'));
    
}

function executeRedirect() {
    const role = localStorage.getItem('userRole');
    if (role === 'seller') {
        window.location.href = '../../seller/dashboard/dashboard_seller.html';
    } else if (role === 'buyer') {
        window.location.href = '../../buyer/market/dashboard_buyer.html';
    } else {
        showToast('Success! But please choose your role first!');
        setTimeout(() => {
            window.location.href = '../register/role.html';
        }, 1500);
    }
}

function loginWithGoogle() {
    window.location.href = 'http://localhost:3000/api/auth/google';
}