const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async () => {
    const cartContainer = document.getElementById("cartItemsContainer");

    function formatPrice(price) { return `Rp ${price.toLocaleString("id-ID")}`; }

    // Helper fetch dengan token auth
    const apiFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
        if (options.body) headers['Content-Type'] = 'application/json';
        return fetch(url, { ...options, headers });
    };
    
    const loadCart = async () => {
        try {
            const res  = await apiFetch(`${API_URL}/cart`);
            const json = await res.json();
            if (!res.ok) { console.error(json.message); return; }
            const data = json.data;
            renderCart(data.items, data.subtotal, data.tax, data.total);
        } catch (err) {
            console.error('Gagal load cart:', err);
        }
    };

    const renderCart = (cart, subtotal, tax, total) => {
        cartContainer.innerHTML = "";
        if (!cart.length) {
            cartContainer.innerHTML = `<div class="empty-cart"><h3>Your cart is empty</h3></div>`;
            updateSummary(0, 0, 0);
            return;
        }

        cart.forEach((item) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item-card");
            cartItem.innerHTML = `
                <img src="${item.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}"
                     alt="${item.name}" class="cart-item-img"
                     onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <span class="category-tag">${item.category}</span>
                    <div class="qty-controls">
                        <button class="qty-btn minus-btn" data-id="${item.product_id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" value="${item.quantity}" class="qty-input" readonly>
                        <button class="qty-btn plus-btn" data-id="${item.product_id}" data-stock="${item.stock}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-delete" data-id="${item.product_id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="price-info">
                        <h3 class="price-main">${formatPrice(item.price * item.quantity)}</h3>
                        <span class="price-sub">${formatPrice(item.price)} each</span>
                    </div>
                </div>
            `;
            cartContainer.appendChild(cartItem);
        });

        updateSummary(subtotal, tax, total);
        addCartEvents(cart);
    };

    const updateSummary = (subtotal, tax, total) => {
        document.getElementById("subtotalValue").textContent = formatPrice(subtotal);
        document.getElementById("taxValue").textContent      = formatPrice(tax);
        document.getElementById("totalValue").textContent    = formatPrice(total);
    };

    const addCartEvents = (cart) => {
        document.querySelectorAll(".plus-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const productId = btn.dataset.id;
                const stock     = parseInt(btn.dataset.stock);
                const item      = cart.find(i => String(i.product_id) === String(productId));
                if (!item) return;

                if (item.quantity >= stock) {
                    alert('Stok tidak mencukupi!'); return;
                }
                await apiFetch(`${API_URL}/cart/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ quantity: item.quantity + 1 }),
                });
                await loadCart();
            });
        });

        document.querySelectorAll(".minus-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const productId = btn.dataset.id;
                const item      = cart.find(i => String(i.product_id) === String(productId));
                if (!item) return;

                if (item.quantity <= 1) {
                    // Kalau qty sudah 1 dan dikurangi → hapus dari cart
                    await apiFetch(`${API_URL}/cart/${productId}`, { method: 'DELETE' });
                } else {
                    await apiFetch(`${API_URL}/cart/${productId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ quantity: item.quantity - 1 }),
                    });
                }
                await loadCart();
            });
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                await apiFetch(`${API_URL}/cart/${btn.dataset.id}`, { method: 'DELETE' });
                await loadCart();
            });
        });
    };

    await loadCart();
});
