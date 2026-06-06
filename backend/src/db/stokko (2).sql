-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 06 Jun 2026 pada 11.59
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stokko`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` enum('low_stock','new_order','order_update','price_alert','system') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `order_id` int(10) UNSIGNED DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `product_id`, `order_id`, `is_read`, `created_at`) VALUES
(1, 2, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 16:28:55'),
(2, 2, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 16:46:54'),
(3, 7, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 20:13:11'),
(4, 7, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 20:15:46'),
(5, 4, 'order_update', 'Order Placed Successfully 🎉', 'Order #4 berhasil dibuat dan sedang menunggu konfirmasi seller.', NULL, 4, 0, '2026-05-28 04:32:34'),
(6, 6, 'new_order', 'New Order Received 📦', 'Kamu mendapat order baru untuk: Milk (x1). Order ID: #4', NULL, 4, 0, '2026-05-28 04:32:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `subtotal` int(10) UNSIGNED NOT NULL,
  `tax` int(10) UNSIGNED NOT NULL,
  `total` int(10) UNSIGNED NOT NULL,
  `payment_method` enum('qris','ewallet','card','va') NOT NULL,
  `payment_detail` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `buyer_id`, `status`, `subtotal`, `tax`, `total`, `payment_method`, `payment_detail`, `notes`, `created_at`, `updated_at`) VALUES
(1, 4, 'pending', 24000, 2400, 26400, 'qris', NULL, NULL, '2026-05-28 04:28:07', '2026-05-28 04:28:07'),
(2, 4, 'pending', 24000, 2400, 26400, 'qris', NULL, NULL, '2026-05-28 04:29:01', '2026-05-28 04:29:01'),
(3, 4, 'pending', 24000, 2400, 26400, 'qris', NULL, NULL, '2026-05-28 04:29:52', '2026-05-28 04:29:52'),
(4, 4, 'pending', 24000, 2400, 26400, 'qris', NULL, NULL, '2026-05-28 04:32:34', '2026-05-28 04:32:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `price` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `seller_id`, `quantity`, `price`) VALUES
(1, 1, 8, 6, 1, 24000),
(4, 4, 8, 6, 1, 24000);

-- --------------------------------------------------------

--
-- Struktur dari tabel `price_history`
--

CREATE TABLE `price_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `price` int(10) UNSIGNED NOT NULL,
  `recorded_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `price_history`
--

INSERT INTO `price_history` (`id`, `product_id`, `price`, `recorded_at`, `created_at`) VALUES
(1, 1, 74000, '2026-05-26', '2026-05-26 15:30:25'),
(2, 1, 77000, '2026-05-26', '2026-05-26 15:30:52'),
(3, 2, 13500, '2026-05-26', '2026-05-26 15:41:38'),
(4, 3, 15500, '2026-05-26', '2026-05-26 15:42:34'),
(5, 4, 29000, '2026-05-26', '2026-05-26 15:43:22'),
(6, 5, 21000, '2026-05-26', '2026-05-26 15:43:56'),
(7, 6, 135000, '2026-05-26', '2026-05-26 15:44:33'),
(8, 7, 30000, '2026-05-26', '2026-05-26 15:48:29'),
(9, 8, 24000, '2026-05-26', '2026-05-26 15:48:55'),
(10, 9, 30000, '2026-06-06', '2026-06-06 08:57:07'),
(11, 10, 30000, '2026-06-06', '2026-06-06 08:57:10');

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `category` enum('Meat','Vegetables','Dairy','Fruits','Other') NOT NULL,
  `price` int(10) UNSIGNED NOT NULL,
  `stock` int(10) UNSIGNED DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `views` int(10) UNSIGNED DEFAULT 0,
  `sales_count` int(10) UNSIGNED DEFAULT 0,
  `is_boosted` tinyint(1) DEFAULT 0,
  `boost_expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `seller_id`, `name`, `category`, `price`, `stock`, `image_url`, `views`, `sales_count`, `is_boosted`, `boost_expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 6, 'Chicken Breast', 'Meat', 77000, 26, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779809425/stokko/products/cy3kv74sq2mrhliphuam.jpg', 0, 0, 0, NULL, 1, '2026-05-26 15:30:25', '2026-05-26 15:30:52'),
(2, 6, 'Fresh Carrot (500g)', 'Vegetables', 13500, 12, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810098/stokko/products/xgmia0pvendvckozcjuk.jpg', 0, 0, 0, NULL, 1, '2026-05-26 15:41:38', '2026-05-26 15:41:38'),
(3, 6, 'Tomatoes (500g)', 'Vegetables', 15500, 23, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810154/stokko/products/xw7uhg9vo4bdwzyg9dle.jpg', 0, 0, 0, NULL, 1, '2026-05-26 15:42:34', '2026-05-26 15:42:34'),
(4, 6, '1 pack of Eggs (10 pcs)', 'Dairy', 29000, 42, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810202/stokko/products/zl1womwnyp5qyyg5i0nw.jpg', 0, 0, 0, NULL, 1, '2026-05-26 15:43:22', '2026-05-26 15:43:22'),
(5, 6, 'Apples (500g)', 'Fruits', 21000, 6, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810236/stokko/products/cyru3ovj6igeu7uaygum.jpg', 0, 0, 0, NULL, 1, '2026-05-26 15:43:56', '2026-05-26 15:43:56'),
(6, 6, 'Rib Eye (500g)', 'Meat', 135000, 32, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810273/stokko/products/lu0quxngwj9pl2hfhtpv.jpg', 0, 0, 0, NULL, 1, '2026-05-26 15:44:33', '2026-05-26 15:44:33'),
(7, 6, 'Almond (250g)', '', 30000, 25, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810509/stokko/products/iflkeqp53a5v1zohxjt4.jpg', 7, 0, 0, NULL, 1, '2026-05-26 15:48:29', '2026-06-06 08:51:02'),
(8, 6, 'Milk', 'Dairy', 24000, 199, 'https://res.cloudinary.com/do8havyrm/image/upload/v1779810535/stokko/products/faisuepqvcs43bcfawfp.jpg', 10, 1, 0, NULL, 1, '2026-05-26 15:48:55', '2026-06-06 08:37:00'),
(9, 7, 'Banana (500g)', 'Fruits', 30000, 6, 'https://res.cloudinary.com/do8havyrm/image/upload/v1780736227/stokko/products/in4ommod4rg7q6sp4z5z.jpg', 7, 0, 0, NULL, 1, '2026-06-06 08:57:07', '2026-06-06 09:22:11'),
(10, 7, 'Banana (500g)', 'Fruits', 30000, 6, 'https://res.cloudinary.com/do8havyrm/image/upload/v1780736229/stokko/products/e4ckwhguraxojdgbtzx8.jpg', 0, 0, 0, NULL, 0, '2026-06-06 08:57:10', '2026-06-06 08:57:18');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stores`
--

CREATE TABLE `stores` (
  `id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `banner_url` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `response_time` varchar(50) DEFAULT NULL,
  `member_since` date DEFAULT NULL,
  `total_sales` int(10) UNSIGNED DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stores`
--

INSERT INTO `stores` (`id`, `seller_id`, `name`, `bio`, `location`, `phone`, `logo_url`, `banner_url`, `is_verified`, `response_time`, `member_since`, `total_sales`, `created_at`, `updated_at`) VALUES
(1, 7, 'seller1', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-06', 0, '2026-06-06 08:57:49', '2026-06-06 08:57:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `plan` enum('free','monthly','yearly') NOT NULL DEFAULT 'free',
  `price` int(10) UNSIGNED DEFAULT 0,
  `started_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `payment_ref` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan`, `price`, `started_at`, `expires_at`, `is_active`, `payment_ref`, `created_at`, `updated_at`) VALUES
(1, 2, 'monthly', 108900, '2026-05-27 16:46:54', '2026-06-27 16:46:54', 1, NULL, '2026-05-27 16:28:55', '2026-05-27 16:46:54'),
(3, 7, 'monthly', 108900, '2026-05-27 20:15:46', '2026-06-27 20:15:46', 1, NULL, '2026-05-27 20:13:11', '2026-05-27 20:15:46');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('buyer','seller') NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `remember_me` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `password_hash`, `role`, `google_id`, `remember_me`, `created_at`, `updated_at`) VALUES
(1, 'Test User', 'test@gmail.com', '08123456789', '$2a$12$3UzNmdDpZI6s9IVCcfGTB.7.14SyBrKzesT2UQNsiLPktclKZlHsK', 'buyer', NULL, 0, '2026-05-26 08:25:12', '2026-05-26 08:25:12'),
(2, 'saturn ilu', 'ilusaturn@gmail.com', '', '', 'buyer', '114637023775295762856', 0, '2026-05-26 08:54:58', '2026-05-26 08:54:58'),
(3, 'admin', 'admin@gmail.com', '12345689738', '$2a$12$uZ3r0tx.9uEl6bNqN/1h1OdCAgMQD/.IvBxb8BKVNxg2IEcawjAAG', 'buyer', NULL, 0, '2026-05-26 09:02:57', '2026-05-26 09:02:57'),
(4, 'buyer1', 'buyer1@gmail.com', '3479693298329', '$2a$12$x/h5Oo6peeqqiWgEWqHfd.iAET4SWNst1zgKDiRjZGxQ63xFFC09i', 'buyer', NULL, 0, '2026-05-26 09:53:42', '2026-05-26 09:53:42'),
(5, 'buyer2', 'buyer2@gmail.com', '1234554534', '$2a$12$sIL1W1KvYsSxU5R/pdudZ.YAeyKvWVF8.7GsjiVG1BLlE8UohSYgO', 'buyer', NULL, 0, '2026-05-26 09:56:02', '2026-05-26 09:56:02'),
(6, 'admin', 'admin1@gmail.com', '34796913298', '$2a$12$CjuVj2vE6QSGa0Li67opHu2CxYSH3OSsQIAiPaR0BXX3/2utfDJum', 'seller', NULL, 0, '2026-05-26 10:08:44', '2026-05-26 10:08:44'),
(7, 'seller1', 'seller1@gmail.com', '354634564545', '$2a$12$J6Qb.c3.tn7uCgqWbleqO.uMYFWPOW/6V/N45wleVdrUMJkfVoF1q', 'seller', NULL, 0, '2026-05-27 20:09:27', '2026-05-27 20:09:27');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart` (`buyer_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_buyer` (`buyer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_seller` (`seller_id`);

--
-- Indeks untuk tabel `price_history`
--
ALTER TABLE `price_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_date` (`product_id`,`recorded_at`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_seller` (`seller_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `seller_id` (`seller_id`);

--
-- Indeks untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_subscription` (`user_id`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `price_history`
--
ALTER TABLE `price_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `price_history`
--
ALTER TABLE `price_history`
  ADD CONSTRAINT `price_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
