const storesData = {
    "s1": { name: "Fresh Farm Produce", isVerified: true, bio: "We are a family-owned farm committed to providing the freshest organic produce directly from our fields to your table.", location: "Jakarta Selatan, Indonesia", response: "< 1 Hour", phone: "+62 812 3456 7890", email: "contact@freshfarm.com", sales: 1250, memberSince: "January 2024", productCount: 24, logo: "../images/store-logo.png", banner: "../images/farm-banner.jpg" },
    "s2": { name: "Organic Veggies", isVerified: false, bio: "Your daily dose of fresh and organic vegetables, handpicked carefully to ensure the best quality.", location: "Bandung, Indonesia", response: "1-2 Hours", phone: "+62 811 1111 2222", email: "hello@organicveggies.com", sales: 840, memberSince: "March 2024", productCount: 15, logo: "../images/img4.png", banner: "../images/pic1.png" },
    "s3": { name: "Daily Dairy & Fruits", isVerified: true, bio: "Providing the best dairy products and fresh fruits directly from trusted suppliers.", location: "Surabaya, Indonesia", response: "< 30 Mins", phone: "+62 899 9999 8888", email: "info@dailydairy.com", sales: 3200, memberSince: "November 2023", productCount: 42, logo: "../images/logoBlue.png", banner: "../images/banner2.png" }
};

const productsData = [
    { 
        id: "p1", name: "Chicken Breast (500gr)", category: "Meat", 
        price: 38500, stock: 80, image: "../images/chicken.jpg", sellerId: "s1",
        history: [37000, 37200, 37200, 37500, 37800, 38000, 38500] // Harga NAIK
    },
    { 
        id: "p2", name: "Fresh Carrots (500g)", category: "Vegetables", 
        price: 11500, stock: 0, image: "../images/carrot.jpg", sellerId: "s2",
        history: [13500, 13000, 12800, 12500, 12200, 12000, 11500] // Harga TURUN
    },
    { 
        id: "p3", name: "Fresh Milk (1L)", category: "Dairy", 
        price: 24000, stock: 200, image: "../images/milk.jpg", sellerId: "s3",
        history: [24000, 24000, 23500, 23800, 24000, 24000, 24000] // Harga STABIL
    },
    { 
        id: "p4", name: "Fresh Organic Tomatoes (500gr)", category: "Vegetables", 
        price: 15500, stock: 150, image: "../images/tomatoes.jpg", sellerId: "s2",
        history: [14000, 14200, 14500, 14500, 14800, 15000, 15500] // Harga NAIK
    },
    { 
        id: "p5", name: "1 pack of Eggs (10 pcs)", category: "Dairy", 
        price: 27500, stock: 45, image: "../images/eggs.jpg", sellerId: "s1",
        history: [29000, 28500, 28500, 28200, 28000, 28000, 27500] // Harga TURUN
    },
    { 
        id: "p6", name: "Apples (500gr)", category: "Fruits", 
        price: 22500, stock: 20, image: "../images/apples.jpg", sellerId: "s3",
        history: [21000, 21500, 21500, 21800, 22000, 22000, 22500] // Harga NAIK
    }
];