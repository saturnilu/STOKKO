const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage khusus untuk gambar produk
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stokko/products',       
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 400, crop: 'fill' }], 
  },
});

// Storage khusus untuk avatar/logo toko
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stokko/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }],
  },
});

// Validasi ukuran file max 2MB
const fileSizeLimit = 2 * 1024 * 1024;

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File harus berupa gambar (JPG, PNG, WebP).'), false);
    }
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File harus berupa gambar (JPG, PNG, WebP).'), false);
    }
  },
});

module.exports = { cloudinary, uploadProduct, uploadAvatar };
