const API_URL = 'http://localhost:3000/api';

// Tangkap token dari Google OAuth redirect
(function() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    if (token) {
        localStorage.setItem('token', token);
        if (userParam) {
            try { localStorage.setItem('currentUser', decodeURIComponent(userParam)); } catch(e) {}
        }
        // Bersihkan URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

document.addEventListener("DOMContentLoaded", async () => {
    const productGrid   = document.getElementById("productGrid");
    const filterPills   = document.querySelectorAll(".filter-pill");
    const searchInput   = document.querySelector(".search-bar input");
    const floatingCart  = document.getElementById("floatingCartBtn");

    let allProducts  = [];
    let activeCategory = "All";

    if (floatingCart) {
        floatingCart.addEventListener("click", () => window.location.href = "cart.html");
    }

    const formatPrice = (price) => `Rp ${price.toLocaleString("id-ID")}`;

    // Load produk dari backend 
    const loadProducts = async (category = "All", search = "") => {
        try {
            let url = `${API_URL}/products?`;
            if (category && category !== "All") url += `category=${category}&`;
            if (search) url += `search=${encodeURIComponent(search)}`;

            const res = await fetch(url);
            const json = await res.json();
            if (!res.ok) { console.error(json.message); return; }

            allProducts = json.data.products;
            renderProducts(allProducts);
        } catch (err) {
            console.error('Gagal load produk:', err);
        }
    };

    const renderProducts = (products) => {
        if (!productGrid) return;
        productGrid.innerHTML = "";

        if (!products.length) {
            productGrid.innerHTML = '<p style="color:#aaa; padding:20px;">Tidak ada produk ditemukan.</p>';
            return;
        }

        products.forEach((product) => {
            const isOutOfStock = product.stock === 0;
            const isVerified   = product.is_verified || product.is_boosted;
            const imgSrc       = product.image_url || 'https://via.placeholder.com/300x200?text=No+Image';

            const card = document.createElement("div");
            card.classList.add("product-card");
            card.innerHTML = `
                <div class="product-img">
                    <img src="${imgSrc}" alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    ${isVerified ? `<span class="badge-verified"><i class="fas fa-check-circle"></i> Verified Seller</span>` : ""}
                    ${isOutOfStock ? `<div class="out-of-stock-overlay"><span>Out of Stock</span></div>` : ""}
                </div>
                <div class="product-details">
                    <h4>${product.name}</h4>
                    <span class="category-tag">${product.category}</span>
                    <div class="price-section">
                        <span class="price-label">Price</span>
                        <h3 class="price-amount">${formatPrice(product.price)}</h3>
                        <span class="stock-amount ${isOutOfStock ? 'out-of-stock-text' : ''}">Stock: ${product.stock}</span>
                    </div>
                    <button class="btn-add-cart"
                        ${isOutOfStock ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
                        Add to Cart
                    </button>
                </div>
            `;

            // Add to cart
            const addBtn = card.querySelector(".btn-add-cart");
            if (!isOutOfStock) {
                addBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    addToCart(product);
                });
            }

            // Klik card → detail produk
            card.addEventListener("click", () => {
                localStorage.setItem("selectedProductId", product.id);
                window.location.href = "detail.html";
            });

            productGrid.appendChild(card);
        });
    };

    const addToCart = async (product) => {

        try {

            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL}/cart`, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || 'Failed to add to cart');
                return;
            }

            showCartToast(product.name);

        } catch (err) {

            console.error(err);

            alert('Cannot connect to server');
        }
    };

    const showCartToast = (name) => {
        const toast = document.createElement('div');
        toast.innerText = `✓ ${name} ditambahkan ke cart!`;
        toast.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#4CAF50;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-weight:bold;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    };

    // Banner auto-slide
    const bannerImgs = ['../images/pic1.png', '../images/pic2.png', '../images/pic3.png'];
    const bannerImg  = document.querySelector('.promo-slider img');
    const dots       = document.querySelectorAll('.dot');
    let currentBanner = 0;

    function goToBanner(idx) {
        currentBanner = idx;
        if (bannerImg) bannerImg.src = bannerImgs[idx];
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goToBanner(i)));
    setInterval(() => goToBanner((currentBanner + 1) % bannerImgs.length), 3000);

    // Filter kategori
    filterPills.forEach(pill => {
        pill.addEventListener("click", async () => {
            filterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeCategory = pill.dataset.category || pill.textContent.trim();
            await loadProducts(activeCategory, searchInput?.value || "");
        });
    });

    // Search
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                await loadProducts(activeCategory, searchInput.value);
            }, 400);
        });
    }

    await loadProducts();
});
