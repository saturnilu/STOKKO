const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    const checkoutItemsContainer = document.getElementById("checkoutItemsContainer");
    const btnCompletePayment     = document.getElementById("btnCompletePayment");

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
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }

    function formatPrice(price) { return `Rp ${price.toLocaleString("id-ID")}`; }

    let cartData = { items: [], subtotal: 0, tax: 0, total: 0 };

    const loadCheckoutSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${API_URL}/cart`, {
                
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) { console.error(json.message); return; }

            const data = json.data;
            cartData = data;
            renderCheckoutSummary(data);
        } catch (err) {
            console.error('Gagal load checkout summary:', err);
        }
    };

    const renderCheckoutSummary = ({ items, subtotal, tax, total }) => {
        if (!checkoutItemsContainer) return;
        checkoutItemsContainer.innerHTML = "";

        items.forEach(item => {
            const itemLine = document.createElement("div");
            itemLine.classList.add("summary-item-line");
            itemLine.innerHTML = `
                <span class="item-name">${item.name} x ${item.quantity}</span>
                <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
            `;
            checkoutItemsContainer.appendChild(itemLine);
        });

        document.getElementById("checkoutSubtotal").textContent = formatPrice(subtotal);
        document.getElementById("checkoutTax").textContent      = formatPrice(tax);
        document.getElementById("checkoutTotal").textContent    = formatPrice(total);
    };

    let selectedPaymentMethod = 'qris';
    window._selectedPaymentMethod = 'qris'; // sync dengan selectPayment() di luar DOMContentLoaded

    if (btnCompletePayment) {
        btnCompletePayment.addEventListener("click", async () => {
            if (!cartData.items.length) {
                showToast("Keranjang kamu kosong.", "error");
                setTimeout(() => { window.location.href = "../market/dashboard_buyer.html"; }, 2000);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res   = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        payment_method: window._selectedPaymentMethod || selectedPaymentMethod,
                        payment_detail: getPaymentDetail(window._selectedPaymentMethod || selectedPaymentMethod),
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    showToast(data.message || 'Pembayaran gagal.', 'error'); return;
                }

                showToast("Payment Successful! Order has been placed.", "success");
                setTimeout(() => { window.location.href = "../orders/orders_buyer.html"; }, 2000);
            } catch (err) {
                showToast('Tidak bisa terhubung ke server.', 'error');
            }
        });
    }

    // Ambil detail payment sesuai metode yang dipilih
    function getPaymentDetail(method) {
        if (method === 'ewallet') {
            const selected = document.querySelector('.selected-wallet');
            return selected ? selected.textContent.trim() : null;
        }
        if (method === 'card') {
            const cardInput = document.querySelector('#detail-card input');
            return cardInput ? cardInput.value.slice(-4) : null; // simpan 4 digit terakhir saja
        }
        return null;
    }

    await loadCheckoutSummary();
});

function selectPayment(element, methodId) {
    document.querySelectorAll('.payment-method-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
    element.querySelector('input').checked = true;

    document.querySelectorAll('.payment-dynamic-section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById('detail-' + methodId);
    if (activeSection) activeSection.classList.add('active');

    // Update selected method untuk dipakai saat submit
    window._selectedPaymentMethod = methodId;
}

function selectEwallet(element) {
    document.querySelectorAll('.ewallet-item').forEach(item => {
        item.classList.remove('selected-wallet');
    });
    element.classList.add('selected-wallet');
}