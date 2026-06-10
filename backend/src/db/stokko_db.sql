-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2026 at 01:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `buyer_id`, `product_id`, `quantity`, `added_at`) VALUES
(24, 22, 20, 2, '2026-06-10 10:40:29');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
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
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `product_id`, `order_id`, `is_read`, `created_at`) VALUES
(1, 2, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 16:28:55'),
(2, 2, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 16:46:54'),
(3, 7, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 20:13:11'),
(4, 7, 'system', 'Upgraded to Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Nikmati semua fitur eksklusif STOKKO.', NULL, NULL, 0, '2026-05-27 20:15:46'),
(8, 7, 'new_order', 'New Order Received 📦', 'Kamu mendapat order baru untuk: Banana (500g) (x2). Order ID: #5', NULL, NULL, 0, '2026-06-06 15:27:40'),
(16, 7, 'new_order', 'New Order Received 📦', 'Kamu mendapat order baru untuk: Banana (500g) (x1). Order ID: #14', NULL, NULL, 0, '2026-06-07 04:56:40'),
(18, 7, 'new_order', 'New Order Received 📦', 'Kamu mendapat order baru untuk: Banana (500g) (x1). Order ID: #15', NULL, NULL, 0, '2026-06-07 04:56:52'),
(22, 7, 'new_order', 'New Order Received 📦', 'Kamu mendapat order baru untuk: Banana (500g) (x1). Order ID: #16', NULL, NULL, 0, '2026-06-07 05:08:09'),
(32, 7, 'new_order', 'New Order Received 📦', 'Kamu mendapat order baru untuk: Banana (500g) (x1). Order ID: #18', NULL, NULL, 0, '2026-06-07 09:34:05'),
(45, 22, 'order_update', 'Order Placed Successfully 🎉', 'Order #20 berhasil dibuat dan sedang menunggu konfirmasi seller.', NULL, 20, 1, '2026-06-10 10:35:59'),
(47, 22, 'order_update', 'Order Update: Processing', 'Pesanan kamu sedang diproses oleh seller.', NULL, 20, 1, '2026-06-10 10:37:23'),
(48, 21, 'low_stock', 'Low Stock Alert', 'Stok produk \"Chicken Breast (500g)\" tinggal 3!', 20, NULL, 1, '2026-06-10 10:37:57'),
(49, 21, 'system', 'Berhasil Berlangganan Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Masa aktif hingga 2026-07-10.', NULL, NULL, 1, '2026-06-10 10:38:28'),
(50, 22, 'system', 'Berhasil Berlangganan Premium 🎉', 'Selamat! Kamu sekarang Premium monthly. Masa aktif hingga 2026-07-10.', NULL, NULL, 0, '2026-06-10 10:41:02');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
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
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `buyer_id`, `status`, `subtotal`, `tax`, `total`, `payment_method`, `payment_detail`, `notes`, `created_at`, `updated_at`) VALUES
(20, 22, 'processing', 38000, 3800, 41800, 'va', NULL, NULL, '2026-06-10 10:35:59', '2026-06-10 10:37:23');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
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
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `seller_id`, `quantity`, `price`) VALUES
(23, 20, 20, 21, 1, 38000);

-- --------------------------------------------------------

--
-- Table structure for table `price_history`
--

CREATE TABLE `price_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `price` int(10) UNSIGNED NOT NULL,
  `recorded_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `price_history`
--

INSERT INTO `price_history` (`id`, `product_id`, `price`, `recorded_at`, `created_at`) VALUES
(10, 9, 30000, '2026-06-06', '2026-06-06 08:57:07'),
(11, 10, 30000, '2026-06-06', '2026-06-06 08:57:10'),
(45, 23, 10000, '2026-06-10', '2026-06-10 10:39:42'),
(46, 20, 30000, '2026-06-04', '2026-06-10 10:45:45'),
(47, 20, 31500, '2026-06-05', '2026-06-10 10:45:45'),
(48, 20, 33000, '2026-06-06', '2026-06-10 10:45:45'),
(49, 20, 34000, '2026-06-07', '2026-06-10 10:45:45'),
(50, 20, 36500, '2026-06-08', '2026-06-10 10:45:45'),
(51, 20, 37000, '2026-06-09', '2026-06-10 10:45:45'),
(52, 20, 38000, '2026-06-10', '2026-06-10 10:45:45'),
(53, 21, 32000, '2026-06-04', '2026-06-10 10:45:45'),
(54, 21, 30000, '2026-06-05', '2026-06-10 10:45:45'),
(55, 21, 28500, '2026-06-06', '2026-06-10 10:45:45'),
(56, 21, 26000, '2026-06-07', '2026-06-10 10:45:45'),
(57, 21, 25000, '2026-06-08', '2026-06-10 10:45:45'),
(58, 21, 23500, '2026-06-09', '2026-06-10 10:45:45'),
(59, 21, 22000, '2026-06-10', '2026-06-10 10:45:45'),
(60, 22, 10000, '2026-06-04', '2026-06-10 10:45:45'),
(61, 22, 11500, '2026-06-05', '2026-06-10 10:45:45'),
(62, 22, 9500, '2026-06-06', '2026-06-10 10:45:45'),
(63, 22, 13000, '2026-06-07', '2026-06-10 10:45:45'),
(64, 22, 10500, '2026-06-08', '2026-06-10 10:45:45'),
(65, 22, 12500, '2026-06-09', '2026-06-10 10:45:45'),
(66, 22, 12000, '2026-06-10', '2026-06-10 10:45:45');

-- --------------------------------------------------------

--
-- Table structure for table `products`
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
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `seller_id`, `name`, `category`, `price`, `stock`, `image_url`, `views`, `sales_count`, `is_boosted`, `boost_expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(9, 7, 'Banana (500g)', 'Fruits', 30000, 0, 'https://res.cloudinary.com/do8havyrm/image/upload/v1780736227/stokko/products/in4ommod4rg7q6sp4z5z.jpg', 13, 6, 0, NULL, 1, '2026-06-06 08:57:07', '2026-06-07 09:34:19'),
(10, 7, 'Banana (500g)', 'Fruits', 30000, 6, 'https://res.cloudinary.com/do8havyrm/image/upload/v1780736229/stokko/products/e4ckwhguraxojdgbtzx8.jpg', 0, 0, 0, NULL, 0, '2026-06-06 08:57:10', '2026-06-06 08:57:18'),
(20, 21, 'Chicken Breast (500g)', 'Meat', 38000, 3, 'https://res.cloudinary.com/do8havyrm/image/upload/v1781087592/stokko/products/fukkbpiq33z5xzn3gxoj.png', 0, 1, 1, '2026-06-17 10:39:06', 1, '2026-06-10 10:33:05', '2026-06-10 10:39:06'),
(21, 21, 'Apples (500g)', 'Fruits', 22000, 100, 'https://res.cloudinary.com/do8havyrm/image/upload/v1781087625/stokko/products/byr6tymldvkbrvu5x60c.png', 0, 0, 1, '2026-06-17 10:39:01', 1, '2026-06-10 10:33:38', '2026-06-10 10:39:01'),
(22, 21, 'Fresh Carrot (500g)', 'Vegetables', 12000, 1, 'https://res.cloudinary.com/do8havyrm/image/upload/v1781087661/stokko/products/huwcn2fyvu8tangqqq5w.png', 0, 0, 0, NULL, 0, '2026-06-10 10:34:14', '2026-06-10 10:34:23'),
(23, 21, 'Normal Apple', 'Fruits', 10000, 1, 'https://res.cloudinary.com/do8havyrm/image/upload/v1781087990/stokko/products/daal9mtfnxyuaebyxlg9.png', 0, 0, 0, NULL, 1, '2026-06-10 10:39:42', '2026-06-10 10:39:42');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
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
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `seller_id`, `name`, `bio`, `location`, `phone`, `logo_url`, `banner_url`, `is_verified`, `response_time`, `member_since`, `total_sales`, `created_at`, `updated_at`) VALUES
(1, 7, 'seller1', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-06', 0, '2026-06-06 08:57:49', '2026-06-06 08:57:49'),
(8, 21, 'jesicaSeller', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-10', 0, '2026-06-10 10:32:15', '2026-06-10 10:32:15');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
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
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan`, `price`, `started_at`, `expires_at`, `is_active`, `payment_ref`, `created_at`, `updated_at`) VALUES
(11, 21, 'monthly', 108900, '2026-06-10 10:38:28', '2026-07-10 10:38:28', 1, 'SUB-21-1781087908710', '2026-06-10 10:38:28', '2026-06-10 10:38:28'),
(12, 22, 'monthly', 108900, '2026-06-10 10:41:02', '2026-07-10 10:41:02', 1, 'SUB-22-1781088062600', '2026-06-10 10:41:02', '2026-06-10 10:41:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('buyer','seller') NOT NULL,
  `is_premium` tinyint(1) NOT NULL DEFAULT 0,
  `google_id` varchar(255) DEFAULT NULL,
  `remember_me` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `password_hash`, `role`, `is_premium`, `google_id`, `remember_me`, `created_at`, `updated_at`) VALUES
(1, 'Test User', 'test@gmail.com', '08123456789', '$2a$12$3UzNmdDpZI6s9IVCcfGTB.7.14SyBrKzesT2UQNsiLPktclKZlHsK', 'buyer', 0, NULL, 0, '2026-05-26 08:25:12', '2026-05-26 08:25:12'),
(2, 'saturn ilu', 'ilusaturn@gmail.com', '', '', 'buyer', 0, '114637023775295762856', 0, '2026-05-26 08:54:58', '2026-05-26 08:54:58'),
(3, 'admin', 'admin@gmail.com', '12345689738', '$2a$12$uZ3r0tx.9uEl6bNqN/1h1OdCAgMQD/.IvBxb8BKVNxg2IEcawjAAG', 'buyer', 0, NULL, 0, '2026-05-26 09:02:57', '2026-05-26 09:02:57'),
(7, 'seller1', 'seller1@gmail.com', '354634564545', '$2a$12$J6Qb.c3.tn7uCgqWbleqO.uMYFWPOW/6V/N45wleVdrUMJkfVoF1q', 'seller', 0, NULL, 0, '2026-05-27 20:09:27', '2026-05-27 20:09:27'),
(21, 'jesicaSeller', 'Jesicapriscila6@gmail.com', '082124715771', '$2a$12$CCD5HL5bt1qcaED2bofWfuhkl2o96nNHlIEzSUCwV7zHTCeIVul1K', 'seller', 1, NULL, 0, '2026-06-10 10:32:15', '2026-06-10 10:38:28'),
(22, 'JesicaBuyer', 'jesstudies23@gmail.com', '082124715777', '$2a$12$RU0089PsGYH9wcfa7RCvse7JShdYBgVMr4AWsYTRVSTAw0a83ZzBC', 'buyer', 1, NULL, 0, '2026-06-10 10:35:19', '2026-06-10 10:41:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart` (`buyer_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_buyer` (`buyer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_seller` (`seller_id`);

--
-- Indexes for table `price_history`
--
ALTER TABLE `price_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_date` (`product_id`,`recorded_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_seller` (`seller_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `seller_id` (`seller_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_subscription` (`user_id`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `price_history`
--
ALTER TABLE `price_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `price_history`
--
ALTER TABLE `price_history`
  ADD CONSTRAINT `price_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
