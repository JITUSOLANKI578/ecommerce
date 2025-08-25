const express = require('express');
const multer = require('multer');
const { body, param, query } = require('express-validator');
const imageController = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware
const validateCategory = [
  param('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Category can only contain letters, numbers, hyphens, and underscores')
];

const validatePublicId = [
  param('publicId')
    .notEmpty()
    .withMessage('Public ID is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Public ID must be between 1 and 200 characters')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateTags = [
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string')
];

const validateUpload = [
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  body('filename')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Filename must be between 1 and 100 characters')
];

// Public routes
router.get('/categories', imageController.getCategories);

router.get('/test-images', async (req, res) => {
  try {
    const result = await cloudinary.v2.search
      .expression('folder:gowns')
      .sort_by('public_id', 'desc')
      .max_results(100)
      .execute();

    res.json(result.resources);
  } catch (err) {
    console.error('Error fetching images via search:', err);
    res.status(500).send('Error fetching images');
  }
});

router.get('/images',
  validatePagination,
  validateTags,
  imageController.getAllImages
);

router.get('/category/:category',
  validateCategory,
  validatePagination,
  validateTags,
  imageController.getImagesFromFolder
);

router.get('/search',
  query('q').notEmpty().withMessage('Search query is required'),
  validatePagination,
  imageController.searchImages
);

router.get('/tags',
  query('tags').notEmpty().withMessage('Tags parameter is required'),
  validatePagination,
  imageController.getImagesByTags
);

router.get('/details/:publicId',
  validatePublicId,
  imageController.getImageDetails
);


// Protected routes (require authentication)
router.use(protect);

router.post('/upload/:category',
  authorize('admin', 'vendor'),
  upload.single('image'),
  validateCategory,
  validateUpload,
  imageController.uploadImage
);

router.delete('/:publicId',
  authorize('admin', 'vendor'),
  validatePublicId,
  imageController.deleteImage
);

router.put('/bulk-tags',
  authorize('admin'),
  body('publicIds')
    .isArray({ min: 1 })
    .withMessage('Public IDs array is required'),
  body('tags')
    .isArray({ min: 1 })
    .withMessage('Tags array is required'),
  imageController.bulkUpdateTags
);

// Admin only routes
router.get('/stats',
  authorize('admin'),
  imageController.getUsageStats
);

module.exports = router;