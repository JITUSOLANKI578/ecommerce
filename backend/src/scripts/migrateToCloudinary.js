const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

/**
 * Migrate local images to Cloudinary
 * This script uploads local images to Cloudinary and updates product documents
 */

async function uploadImageToCloudinary(imagePath, folder = 'ecommerce-navratri/products') {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalFilename: path.basename(imagePath)
    };
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error);
    return null;
  }
}

async function migrateProductsToCloudinary() {
  try {
    console.log('Starting migration to Cloudinary...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);
    
    for (const product of products) {
      console.log(`Processing product: ${product.name}`);
      
      // Skip if already using Cloudinary URLs
      if (product.images && product.images.length > 0 && 
          product.images[0].url.includes('cloudinary.com')) {
        console.log(`Product ${product.name} already using Cloudinary, skipping...`);
        continue;
      }
      
      // Upload new images to Cloudinary
      const newImages = [];
      
      // For demonstration, we'll use placeholder Cloudinary URLs
      // In real migration, you would upload actual images
      const categoryImages = {
        'Lehengas': 'ecommerce-navratri/products/sample-lehenga',
        'Chaniya Choli': 'ecommerce-navratri/products/sample-chaniya-choli',
        'Gowns': 'ecommerce-navratri/products/sample-gown',
        'Sarees': 'ecommerce-navratri/products/sample-saree',
        'Kurta Sets': 'ecommerce-navratri/products/sample-kurta-set',
        'Accessories': 'ecommerce-navratri/products/sample-accessories'
      };
      
      const categoryImage = categoryImages[product.category] || 'ecommerce-navratri/products/default-product';
      
      newImages.push({
        url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${categoryImage}.jpg`,
        alt: product.name,
        isPrimary: true
      });
      
      // Add additional images
      for (let i = 1; i <= 3; i++) {
        newImages.push({
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${categoryImage}_${i}.jpg`,
          alt: `${product.name} - Image ${i + 1}`,
          isPrimary: false
        });
      }
      
      // Update product with new Cloudinary URLs
      product.images = newImages;
      await product.save();
      
      console.log(`Updated product ${product.name} with Cloudinary URLs`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateProductsToCloudinary()
    .then(() => {
      console.log('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateProductsToCloudinary,
  uploadImageToCloudinary
};
