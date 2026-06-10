const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {

    // selectedProductId sekarang adalah ID angka dari DB
    // (disimpan di localStorage saat buyer klik produk di dashboard)
    const selectedProductId = localStorage.getItem('selectedProductId');
    if (!selectedProductId) {
        window.location.href = 'dashboard_buyer.html';
        return;
    }

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

    function formatPrice(price) { return `Rp ${price.toLocaleString("id-ID")}`; }

    //fetch produk dari API bukan dari productsData hardcoded
    let product, seller;
    try {
        const res  = await fetch(`${API_URL}/products/${selectedProductId}`);
        const json = await res.json();
        const data = json.data;
        if (!res.ok || !data.product) {
            showToast('Produk tidak ditemukan.', 'error');
            setTimeout(() => window.location.href = 'dashboard_buyer.html', 1500);
            return;
        }
        product = data.product;
        seller  = {
            name:        product.store_name     || 'Unknown Store',
            isVerified:  product.is_verified    || false,
            location:    product.store_location || '-',
            response:    product.response_time  || '-',
            logo:        product.store_logo     || '',
            phone:       product.store_phone    || '-',
            email:       product.store_email    || '-',
        };
    } catch (err) {
        showToast('Tidak bisa terhubung ke server.', 'error');
        return;
    }

    const imgSrc = product.image_url || 'https://via.placeholder.com/400x300?text=No+Image';
    document.getElementById('mainImage').src  = imgSrc;
    document.getElementById('thumb1').src     = imgSrc;
    document.getElementById('thumb2').src     = imgSrc;
    document.getElementById('thumb3').src     = imgSrc;

    document.getElementById('detailTitle').textContent    = product.name;
    document.getElementById('detailCategory').textContent = product.category;
    document.getElementById('detailPrice').textContent    = formatPrice(product.price);
    document.getElementById('detailStock').textContent    = `Stock : ${product.stock} available`;
    document.getElementById('detailDesc').textContent     = `Premium ${product.name} sourced directly from local farms. Fresh, organic, and of the highest quality.`;

    const verifiedBadge     = document.querySelector('.badge-verified');
    const storeVerifiedIcon = document.querySelector('.verified-icon');
    if (seller.isVerified) {
        if (verifiedBadge)     verifiedBadge.style.display     = 'inline-block';
        if (storeVerifiedIcon) storeVerifiedIcon.style.display = 'inline-block';
    } else {
        if (verifiedBadge)     verifiedBadge.style.display     = 'none';
        if (storeVerifiedIcon) storeVerifiedIcon.style.display = 'none';
    }

    if (seller.logo) document.getElementById('storeLogo').src = seller.logo;
    document.getElementById('storeNameTitle').textContent = seller.name;
    document.getElementById('storeLoc').innerHTML   = `<i class="fas fa-map-marker-alt"></i> ${seller.location}`;
    document.getElementById('storePhone').innerHTML = `<i class="fas fa-phone-alt"></i> ${seller.phone}`;
    document.getElementById('storeMail').innerHTML  = `<i class="fas fa-envelope"></i> ${seller.email}`;

    document.getElementById('btnViewProfile').addEventListener('click', () => {
        localStorage.setItem('selectedSellerId', product.seller_id);
        window.location.href = 'seller_profile.html';
    });

    const minusBtn = document.getElementById('minusBtn');
    const plusBtn  = document.getElementById('plusBtn');
    const qtyInput = document.getElementById('qtyInput');

    if (plusBtn && minusBtn) {
        plusBtn.addEventListener('click', () => {
            let currentVal = parseInt(qtyInput.value);
            if (currentVal < product.stock) qtyInput.value = currentVal + 1;
        });
        minusBtn.addEventListener('click', () => {
            let currentVal = parseInt(qtyInput.value);
            if (currentVal > 1) qtyInput.value = currentVal - 1;
        });
    }
    document.getElementById('detailAddToCart').addEventListener('click', async () => {
        if (product.stock === 0) {
            showToast('item sedang out of stock!', 'error');
            return;
        }
        const qty   = parseInt(qtyInput.value);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id, quantity: qty }),
            });
            const json = await res.json();
            if (!res.ok) { showToast(json.message || 'Gagal tambah ke cart.', 'error'); return; }
            showToast(`${qty} x ${product.name} Added to cart!`);
        } catch (err) {
            showToast('Tidak bisa terhubung ke server.', 'error');
        }
    });
});

// changeImage 
function changeImage(element) {
    document.getElementById('mainImage').src = element.src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}
