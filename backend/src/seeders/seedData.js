const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const connectDB = require('../config/database');
const { logger } = require('../utils/logger');

// Sample data
const categories = [
  {
    name: 'Lehengas',
    description: 'Traditional Indian lehengas for all occasions',
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/lehengas.jpg',
      alt: 'Lehengas Category'
    },
    icon: '👗',
    isFeatured: true,
    sortOrder: 1
  },
  {
    name: 'Chaniya Choli',
    description: 'Perfect for Navratri and Garba celebrations',
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/chaniya-choli.jpg',
      alt: 'Chaniya Choli Category'
    },
    icon: '💃',
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'Gowns',
    description: 'Indo-western gowns for modern occasions',
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/gowns.jpg',
      alt: 'Gowns Category'
    },
    icon: '👑',
    isFeatured: true,
    sortOrder: 3
  },
  {
    name: 'Sarees',
    description: 'Timeless elegance in traditional sarees',
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/sarees.jpg',
      alt: 'Sarees Category'
    },
    icon: '🥻',
    isFeatured: true,
    sortOrder: 4
  },
  {
    name: 'Kurta Sets',
    description: 'Comfortable and stylish kurta sets',
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/kurta-sets.jpg',
      alt: 'Kurta Sets Category'
    },
    icon: '👘',
    isFeatured: false,
    sortOrder: 5
  },
  {
    name: 'Accessories',
    description: 'Complete your ethnic look with accessories',
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/accessories.jpg',
      alt: 'Accessories Category'
    },
    icon: '💎',
    isFeatured: false,
    sortOrder: 6
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@ambika.com',
    phone: '9876543210',
    password: 'admin123',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    avatar: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/avatars/admin.jpg'
    }
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543211',
    password: 'user123',
    role: 'user',
    isEmailVerified: true,
    isPhoneVerified: true,
    dateOfBirth: new Date('1995-05-15'),
    gender: 'female',
    addresses: [{
      type: 'home',
      name: 'Priya Sharma',
      phone: '9876543211',
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true
    }],
    loyalty: {
      points: 1500,
      tier: 'silver',
      totalSpent: 25000
    }
  },
  {
    name: 'Ananya Patel',
    email: 'ananya@example.com',
    phone: '9876543212',
    password: 'user123',
    role: 'user',
    isEmailVerified: true,
    isPhoneVerified: true,
    dateOfBirth: new Date('1992-08-22'),
    gender: 'female',
    addresses: [{
      type: 'home',
      name: 'Ananya Patel',
      phone: '9876543212',
      street: '456 SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      isDefault: true
    }],
    loyalty: {
      points: 2500,
      tier: 'gold',
      totalSpent: 55000
    }
  }
];

const generateProducts = (categories) => {
  const products = [];

  categories.forEach((category, categoryIndex) => {
    for (let i = 1; i <= 10; i++) {
      const basePrice = Math.floor(Math.random() * 15000) + 2000;
      const discountPrice = Math.random() > 0.3 ? Math.floor(basePrice * 0.8) : null;

      const product = {
        name: `${category.name.slice(0, -1)} ${i} - Premium Collection`,
        description: `Exquisite ${category.name.toLowerCase()} crafted with premium materials and intricate detailing. Perfect for special occasions and celebrations. Features traditional craftsmanship with modern styling.`,
        shortDescription: `Premium ${category.name.toLowerCase()} with traditional craftsmanship`,
        basePrice,
        comparePrice: discountPrice ? basePrice : null,
        category: category._id,
        subcategory: i <= 3 ? 'Premium' : i <= 6 ? 'Designer' : 'Traditional',
        brand: ['Ambika', 'Royal Collection', 'Heritage', 'Elegance'][Math.floor(Math.random() * 4)],
        fabric: ['Silk', 'Cotton Silk', 'Georgette', 'Chiffon', 'Velvet'][Math.floor(Math.random() * 5)],
        care: 'Dry clean only',
        occasion: ['Wedding', 'Festival', 'Party', 'Casual'][Math.floor(Math.random() * 4)],
        season: ['All Season', 'Summer', 'Winter'][Math.floor(Math.random() * 3)],

        variants: [
          {
            size: 'S',
            color: 'Red',
            colorCode: '#FF0000',
            sku: `AMB-${categoryIndex}-${i}-S-RED`,
            price: discountPrice || basePrice,
            discountPrice,
            stock: Math.floor(Math.random() * 20) + 5,
            images: [{
              url: `https://images.pexels.com/photos/${8889420 + i}/pexels-photo-${8889420 + i}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1`,
              alt: `${category.name} ${i} - Red - Size S`,
              isPrimary: true
            }],
            measurements: {
              bust: '32-34"',
              waist: '26-28"',
              hip: '34-36"',
              length: '42"'
            }
          },
          {
            size: 'M',
            color: 'Blue',
            colorCode: '#0000FF',
            sku: `AMB-${categoryIndex}-${i}-M-BLUE`,
            price: discountPrice || basePrice,
            discountPrice,
            stock: Math.floor(Math.random() * 20) + 5,
            images: [{
              url: `https://images.pexels.com/photos/${8889450 + i}/pexels-photo-${8889450 + i}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1`,
              alt: `${category.name} ${i} - Blue - Size M`,
              isPrimary: true
            }],
            measurements: {
              bust: '34-36"',
              waist: '28-30"',
              hip: '36-38"',
              length: '42"'
            }
          },
          {
            size: 'L',
            color: 'Green',
            colorCode: '#008000',
            sku: `AMB-${categoryIndex}-${i}-L-GREEN`,
            price: discountPrice || basePrice,
            discountPrice,
            stock: Math.floor(Math.random() * 20) + 5,
            images: [{
              url: `https://images.pexels.com/photos/${8889480 + i}/pexels-photo-${8889480 + i}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1`,
              alt: `${category.name} ${i} - Green - Size L`,
              isPrimary: true
            }],
            measurements: {
              bust: '36-38"',
              waist: '30-32"',
              hip: '38-40"',
              length: '42"'
            }
          }
        ],

        images: [{
          url: `https://images.pexels.com/photos/${8889420 + i}/pexels-photo-${8889420 + i}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1`,
          alt: `${category.name} ${i}`,
          isPrimary: true,
          sortOrder: 1
        }],

        tags: [`#${category.name}`, '#Premium', '#Traditional', '#Handcrafted'],
        searchKeywords: [category.name.toLowerCase(), 'ethnic', 'traditional', 'premium'],

        status: 'active',
        isActive: true,
        isFeatured: i <= 2,
        isNewArrival: i <= 3,
        isBestSeller: i === 1,
        isOnSale: !!discountPrice,

        publishedAt: new Date(),

        reviews: i <= 5 ? [{
          user: null, // Will be populated after users are created
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          title: 'Great quality!',
          comment: 'Absolutely loved this product. Great quality and fast delivery.',
          isVerified: true,
          helpfulCount: Math.floor(Math.random() * 10)
        }] : [],

        faqs: [{
          question: 'What is the fabric of this product?',
          answer: `This product is made of premium ${['Silk', 'Cotton Silk', 'Georgette'][Math.floor(Math.random() * 3)]}.`,
          isActive: true
        }],

        seo: {
          metaTitle: `${category.name.slice(0, -1)} ${i} - Premium Collection | Ambika`,
          metaDescription: `Shop premium ${category.name.toLowerCase()} online. Free shipping, easy returns, and authentic quality guaranteed.`,
          metaKeywords: [category.name.toLowerCase(), 'ethnic wear', 'traditional', 'online shopping']
        },

        weight: Math.floor(Math.random() * 1000) + 500, // 500-1500 grams
        dimensions: {
          length: 30,
          width: 25,
          height: 5
        }
      };

      products.push(product);
    }
  });

  return products;
};

const coupons = [
  {
    code: 'WELCOME10',
    name: 'Welcome Offer',
    description: 'Get 10% off on your first order',
    type: 'percentage',
    value: 10,
    usageLimit: 1000,
    usageLimitPerUser: 1,
    minimumAmount: 1000,
    maximumDiscount: 500,
    newUsersOnly: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true
  },
  {
    code: 'NAVRATRI25',
    name: 'Navratri Special',
    description: 'Flat ₹500 off on orders above ₹2000',
    type: 'fixed',
    value: 500,
    usageLimit: 500,
    usageLimitPerUser: 2,
    minimumAmount: 2000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    isActive: true
  },
  {
    code: 'FREESHIP',
    name: 'Free Shipping',
    description: 'Free shipping on all orders',
    type: 'free_shipping',
    value: 0,
    usageLimit: null,
    usageLimitPerUser: 5,
    minimumAmount: 999,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    isActive: true
  }
];

const seedDatabase = async (options = {}) => {
  const {
    clearData = true,
    seedCategories = true,
    seedUsers = true,
    seedProducts = true,
    seedCoupons = true
  } = options;

  try {
    // Connect to database
    await connectDB();

    logger.info('Starting database seeding...');

    if (clearData) {
      // Clear existing data based on options
      const deletePromises = [];

      if (seedCategories) deletePromises.push(Category.deleteMany({}));
      if (seedUsers) deletePromises.push(User.deleteMany({}));
      if (seedProducts) deletePromises.push(Product.deleteMany({}));
      if (seedCoupons) deletePromises.push(Coupon.deleteMany({}));

      await Promise.all(deletePromises);
      logger.info('Cleared existing data');
    }

    let createdCategories = [];
    let createdUsers = [];
    let createdProducts = [];
    let createdCoupons = [];

    // Create categories
    if (seedCategories) {
      createdCategories = await Category.insertMany(categories);
      logger.info(`Created ${createdCategories.length} categories`);
    }

    // Create users
    if (seedUsers) {
      // Hash passwords before inserting
      const usersWithHashedPasswords = await Promise.all(
        users.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 12);
          return { ...user, password: hashedPassword };
        })
      );

      createdUsers = await User.insertMany(usersWithHashedPasswords);
      logger.info(`Created ${createdUsers.length} users`);
    }

    // Generate and create products
    if (seedProducts) {
      const productData = generateProducts(createdCategories.length > 0 ? createdCategories : categories);

      // Add user references to reviews if users were created
      if (createdUsers.length > 0) {
        productData.forEach(product => {
          if (product.reviews.length > 0) {
            product.reviews[0].user = createdUsers[1]._id; // Assign to Priya
          }
        });
      }

      createdProducts = await Product.insertMany(productData);
      logger.info(`Created ${createdProducts.length} products`);
    }

    // Create coupons
    if (seedCoupons) {
      createdCoupons = await Coupon.insertMany(coupons);
      logger.info(`Created ${createdCoupons.length} coupons`);
    }

    // Update category product counts if both categories and products were created
    if (seedCategories && seedProducts && createdCategories.length > 0) {
      for (const category of createdCategories) {
        const productCount = await Product.countDocuments({ category: category._id });
        await Category.findByIdAndUpdate(category._id, { productCount });
      }
      logger.info('Updated category product counts');
    }

    logger.info('Database seeding completed successfully!');

    // Display summary
    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Coupons: ${createdCoupons.length}`);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@ambika.com / admin123');
    console.log('User 1: priya@example.com / user123');
    console.log('User 2: ananya@example.com / user123');
    console.log('========================\n');

    return {
      categories: createdCategories,
      users: createdUsers,
      products: createdProducts,
      coupons: createdCoupons
    };

  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

// Command line interface
const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    clearData: true,
    seedCategories: true,
    seedUsers: true,
    seedProducts: true,
    seedCoupons: true
  };

  for (const arg of args) {
    switch (arg) {
      case '--no-clear':
        options.clearData = false;
        break;
      case '--categories-only':
        options.seedUsers = false;
        options.seedProducts = false;
        options.seedCoupons = false;
        break;
      case '--users-only':
        options.seedCategories = false;
        options.seedProducts = false;
        options.seedCoupons = false;
        break;
      case '--products-only':
        options.seedCategories = false;
        options.seedUsers = false;
        options.seedCoupons = false;
        break;
      case '--coupons-only':
        options.seedCategories = false;
        options.seedUsers = false;
        options.seedProducts = false;
        break;
      case '--help':
        console.log(`
Database Seeding Options:
  --no-clear         : Skip clearing existing data
  --categories-only  : Seed only categories
  --users-only       : Seed only users
  --products-only    : Seed only products
  --coupons-only     : Seed only coupons
  --help             : Show this help message

Examples:
  npm run seed                          # Seed all data (default)
  npm run seed -- --no-clear            # Seed without clearing existing data
  npm run seed -- --products-only       # Seed only products
  npm run seed -- --categories-only     # Seed only categories
        `);
        process.exit(0);
        break;
    }
  }

  return options;
};

// Run seeding if called directly
if (require.main === module) {
  const options = parseArgs();

  seedDatabase(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
