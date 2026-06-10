// ============================================================
// CATATAN UNTUK FRONTEND DEV:
// Yang BERUBAH: Complete Payment sekarang POST ke API subscription
//               Tidak lagi simpan ke orderHistory/notificationsData localStorage
// Yang TIDAK BERUBAH: getQueryParam, formatPrice, showToast,
//                     planNameDisplay, tax calculation, selectPayment, selectEwallet
// ============================================================

const API_URL = 'http://localhost:3000/api';
let selectedPaymentMethod = 'qris';

function setSelectedPaymentMethod(methodId) {
    selectedPaymentMethod = methodId;
}

document.addEventListener("DOMContentLoaded", () => {

    // getQueryParam — TIDAK BERUBAH
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const planType  = getQueryParam("plan")  || "monthly";
    const rawPrice  = getQueryParam("price") || "99000";
    const basePrice = parseInt(rawPrice);

    function formatPrice(price) {
        return `Rp ${price.toLocaleString("id-ID")}`;
    }

    // Tax calculation — TIDAK BERUBAH
    const tax        = basePrice * 0.1;
    const grandTotal = basePrice + tax;

    document.getElementById("planNameDisplay").textContent  = `Premium Plan (${planType})`;
    document.getElementById("planPriceDisplay").textContent = formatPrice(basePrice);
    document.getElementById("subsSubtotal").textContent     = formatPrice(basePrice);
    document.getElementById("subsTax").textContent          = formatPrice(tax);
    document.getElementById("subsTotal").textContent        = formatPrice(grandTotal);

    // showToast — TIDAK BERUBAH
    function showToast(message, type = 'success') {
        const toast        = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon    = document.getElementById('toastIcon');
        if (!toast) return;
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

    // BERUBAH: Complete Payment sekarang POST ke API /subscriptions
    // Tidak lagi push ke localStorage orderHistory dan notificationsData
    const btnCompletePayment = document.getElementById("btnCompletePayment");
    if (btnCompletePayment) {
        btnCompletePayment.addEventListener("click", async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_URL}/subscriptions/checkout`, {
                    method: 'POST',
                    
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        plan: planType,
                        price: grandTotal,
                        payment_method: selectedPaymentMethod,
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    showToast(data.message || 'Pembayaran gagal.', 'error');
                    return;
                }

                showToast("Payment successfull, Subscription Activated!", "success");
                setTimeout(() => {
                    // Baca role dari JWT token
                    let role = 'buyer';
                    try {
                        const token = localStorage.getItem('token');
                        if (token) {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            role = payload.role || 'buyer';
                        }
                    } catch(e) {}

                    if (role === 'seller') {
                        window.location.href = "../../seller/profilensubscription/subscription_seller.html";
                    } else {
                        window.location.href = "../profilensubscription/subscription_buyer.html";
                    }
                }, 2000);
            } catch (err) {
                showToast('Tidak bisa terhubung ke server.', 'error');
            }
        });
    }
});

// selectPayment & selectEwallet — TIDAK BERUBAH sama sekali
function selectPayment(element, methodId) {
    document.querySelectorAll('.payment-method-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
    element.querySelector('input').checked = true;
    setSelectedPaymentMethod(methodId);

    document.querySelectorAll('.payment-dynamic-section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById('detail-' + methodId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

function selectEwallet(element) {
    document.querySelectorAll('.ewallet-item').forEach(item => {
        item.classList.remove('selected-wallet');
    });
    element.classList.add('selected-wallet');
}