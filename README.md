# 🛒 STOKKO

STOKKO adalah platform marketplace yang membantu pengguna menemukan, membandingkan, dan membeli produk dari berbagai toko dalam satu tempat. Sistem ini menyediakan fitur autentikasi pengguna, manajemen produk, keranjang belanja, pemesanan, notifikasi, serta layanan subscription premium untuk mendapatkan fitur eksklusif seperti Price Insight.

---

## 📌 Features

### 👤 Authentication
- Register akun
- Login menggunakan email/password
- Google OAuth Login
- JWT Authentication
- Logout
- Get Current User

### 🛍 Product Management
- Menampilkan daftar produk
- Detail produk
- Filter dan pencarian produk
- Menampilkan informasi toko penjual

### 🛒 Shopping Cart
- Tambah produk ke keranjang
- Update jumlah produk
- Hapus produk dari keranjang
- Melihat isi keranjang

### 📦 Order Management
- Checkout produk
- Riwayat pesanan
- Status pesanan

### 🔔 Notification System
- Notifikasi sistem
- Notifikasi transaksi
- Notifikasi subscription

### 💎 Premium Subscription
- Paket Monthly
- Paket Yearly
- Aktivasi subscription
- Validasi status premium
- Akses fitur eksklusif

### 📈 Price Insight
- Analisis harga produk
- Fitur khusus pengguna premium

---

# 🏗 Project Structure

```
STOKKO
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── db
│   │   └── app.js
│   └── package.json
│
├── frontend
│   ├── buyer
│   ├── seller
│   ├── screens
│  
│
└── README.md
```

---

# ⚙️ Tech Stack

## Frontend
- HTML
- CSS
- JavaScript (Vanilla JS)

## Backend
- Node.js
- Express.js

## Database
- MySQL

## Authentication
- JWT
- Passport.js
- Google OAuth 2.0

## Additional Services
- Cloudinary (Image Storage)
- Express Session
- Cookie Parser

---

# 🗄 Database Setup

Import database terlebih dahulu:

```sql
backend/src/db/stokko.sql
```

Menggunakan:

- XAMPP
- phpMyAdmin
- MySQL Workbench

Buat database:

```sql
CREATE DATABASE stokko;
```

Kemudian import file:

```sql
stokko.sql
```

---

# 🚀 Backend Installation

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Jalankan server:

```bash
npm run dev
```

atau

```bash
npm start
```

Server berjalan pada:

```text
http://localhost:3000
```

---

# ▶️ Running the Project
## Frontend

Karena frontend menggunakan file HTML statis dan JavaScript yang melakukan request ke backend, disarankan menjalankan frontend menggunakan **Live Server** di Visual Studio Code.

### Steps

1. Buka folder project di Visual Studio Code.
2. Install extension **Live Server** jika belum ada.
3. Cari file:

```text
landing.html
```

4. Klik kanan pada `landing.html`.
5. Pilih:

```text
Open with Live Server
```

6. Website akan otomatis terbuka di browser (Google Chrome direkomendasikan).

---

# 🔑 Environment Variables

Buat file `.env` pada folder backend:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=stokko

JWT_SECRET=your_jwt_secret

SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|----------|------------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/logout |
| GET | /api/auth/me |
| GET | /api/auth/google |

---

## Products

| Method | Endpoint |
|----------|------------|
| GET | /api/products |
| GET | /api/products/:id |

---

## Stores

| Method | Endpoint |
|----------|------------|
| GET | /api/stores/:sellerId |

---

## Cart

| Method | Endpoint |
|----------|------------|
| GET | /api/cart |
| POST | /api/cart |
| PUT | /api/cart/:id |
| DELETE | /api/cart/:id |

---

## Orders

| Method | Endpoint |
|----------|------------|
| GET | /api/orders |
| POST | /api/orders |

---

## Notifications

| Method | Endpoint |
|----------|------------|
| GET | /api/notifications |

---

## Subscriptions

| Method | Endpoint |
|----------|------------|
| GET | /api/subscriptions/me |
| POST | /api/subscriptions/checkout |

---

# 👥 User Roles

## Buyer
- Melihat produk
- Menambahkan ke keranjang
- Checkout
- Mengelola subscription
- Mengakses Price Insight

## Seller
- Mengelola toko
- Menambahkan produk
- Mengelola inventaris

---

# 🎯 Future Improvements

- Payment Gateway Integration
- Real-time Notification
- Product Recommendation System
- AI-based Price Prediction
- Mobile Application
- Advanced Analytics Dashboard

---

# 📚 Academic Project

STOKKO dikembangkan sebagai proyek akademik untuk menerapkan konsep:

- Full Stack Web Development
- REST API Development
- Authentication & Authorization
- Database Design
- Marketplace System Architecture
- Software Engineering Best Practices

---

# 👨‍💻 Authors

Developed by STOKKO Team.
