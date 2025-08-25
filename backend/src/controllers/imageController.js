  const cloudinaryService = require('../services/cloudinaryService');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');
const { cloudinary } = require('../config/cloudinary');
class ImageController {
  /**
   * Get all available categories
   */
  async getCategories(req, res) {
    try {
      const categories = await cloudinaryService.getCategories();

      res.json({
        success: true,
        data: {
          categories,
          totalCount: categories.length
        },
        message: 'Categories fetched successfully'
      });

    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch categories'
      });
    }
  }
  /**
   * Get all images organized by category folders
   */
  async getAllImages(req, res) {
    try {
      const { category } = req.query; // Get category from query parameters
      
      if (category) {
        // If category is provided, fetch images for that specific category
        const result = await cloudinaryService.getImagesByCategory(category);
        return res.json({
          success: true,
          data: {
            images: result.images,
            category,
            totalCount: result.totalCount
          },
          message: `Images fetched successfully for category: ${category}`
        });
      }
      
      // If no category provided, fetch all categories and their images
      const categories = await cloudinaryService.getCategories();
      
      // Fetch images for each category
      const imagesByCategory = {};
      let totalImages = 0;
      
      for (const category of categories) {
        try {
          const result = await cloudinaryService.getImagesByCategory(category.name, {
            limit: 50 // Limit per category to avoid too many requests
          });
          
          imagesByCategory[category.name] = {
            images: result.images,
            totalCount: result.totalCount,
            displayName: category.displayName
          };
          
          totalImages += result.totalCount;
        } catch (error) {
          logger.warn(`Failed to fetch images for category ${category.name}:`, error.message);
          imagesByCategory[category.name] = {
            images: [],
            totalCount: 0,
            displayName: category.displayName,
            error: error.message
          };
        }
      }
      
      res.json({
        success: true,
        data: {
          categories: imagesByCategory,
          totalCategories: categories.length,
          totalImages,
          categoriesList: categories.map(cat => ({
            name: cat.name,
            displayName: cat.displayName,
            path: cat.path,
            imageCount: imagesByCategory[cat.name]?.totalCount || 0
          }))
        },
        message: 'All images fetched successfully organized by categories'
      });
    } catch (err) {
      logger.error('Error fetching all images:', err);
      res.status(500).json({
        success: false,
        message: 'Error fetching images',
        error: err.message
      });
    }
  }

  /**
   * Get images from a specific folder
   */
async getImagesFromFolder(req, res) {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50, tags, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    // Use the service method instead of direct Cloudinary call
    const result = await cloudinaryService.getImagesByCategory(category, {
      page: parseInt(page),
      limit: parseInt(limit),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result,
      message: `Images fetched successfully for category: ${category}`
    });
  } catch (err) {
    logger.error('Error fetching images from folder:', err);
    if (err.http_code === 420) {
      res.status(429).json({
        success: false,
        message: 'Cloudinary rate limit exceeded. Please try again later.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error fetching images',
        error: err.message
      });
    }
  }
}

  /**
   * Get images by tags
   */
  async getImagesByTags(req, res) {
    try {
      const { tags } = req.query;

      if (!tags) {
        return res.status(400).json({
          success: false,
          message: 'Tags parameter is required'
        });
      }

      const tagArray = tags.split(',').map(tag => tag.trim());
      const options = {
        limit: parseInt(req.query.limit) || 50,
        category: req.query.category || null
      };

      const result = await cloudinaryService.getImagesByTags(tagArray, options);

      res.json({
        success: true,
        data: result,
        message: 'Images fetched successfully by tags'
      });

    } catch (error) {
      logger.error('Get images by tags error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch images by tags'
      });
    }
  }

  /**
   * Search images
   */
  async searchImages(req, res) {
    try {
      const { q: query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const options = {
        limit: parseInt(req.query.limit) || 20,
        category: req.query.category || null
      };

      const result = await cloudinaryService.searchImages(query, options);

      res.json({
        success: true,
        data: result,
        message: 'Image search completed successfully'
      });

    } catch (error) {
      logger.error('Search images error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search images'
      });
    }
  }

  /**
   * Get image details
   */
  async getImageDetails(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
      }

      const imageDetails = await cloudinaryService.getImageDetails(publicId);

      res.json({
        success: true,
        data: imageDetails,
        message: 'Image details fetched successfully'
      });

    } catch (error) {
      logger.error('Get image details error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch image details'
      });
    }
  }

  /**
   * Upload image
   */
  async uploadImage(req, res) {
    try {
      const { category } = req.params;
      const { tags, filename } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      const options = {
        tags: tags ? tags.split(',') : [],
        filename
      };

      const result = await cloudinaryService.uploadImage(req.file.path, category, options);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Image uploaded successfully'
      });

    } catch (error) {
      logger.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image'
      });
    }
  }

  /**
   * Delete image
   */
  async deleteImage(req, res) {
    try {
      const { publicId } = req.params;

      const result = await cloudinaryService.deleteImage(publicId);

      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to delete image'
        });
      }

    } catch (error) {
      logger.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete image'
      });
    }
  }

  /**
   * Generate optimized URL
   */
  async generateOptimizedUrl(req, res) {
    try {
      const { publicId } = req.params;
      const transformations = req.body;

      const optimizedUrl = cloudinaryService.generateOptimizedUrl(publicId, transformations);

      if (!optimizedUrl) {
        return res.status(400).json({
          success: false,
          message: 'Failed to generate optimized URL'
        });
      }

      res.json({
        success: true,
        data: {
          originalPublicId: publicId,
          optimizedUrl,
          transformations
        },
        message: 'Optimized URL generated successfully'
      });

    } catch (error) {
      logger.error('Generate optimized URL error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate optimized URL'
      });
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(req, res) {
    try {
      const stats = await cloudinaryService.getUsageStats();

      res.json({
        success: true,
        data: stats,
        message: 'Usage statistics fetched successfully'
      });

    } catch (error) {
      logger.error('Get usage stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch usage statistics'
      });
    }
  }

  /**
   * Bulk update tags
   */
  async bulkUpdateTags(req, res) {
    try {
      const { publicIds, tags } = req.body;

      if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Public IDs array is required'
        });
      }

      if (!tags || !Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'Tags array is required'
        });
      }

      const result = await cloudinaryService.bulkUpdateTags(publicIds, tags);

      res.json({
        success: true,
        data: result,
        message: 'Tags updated successfully'
      });

    } catch (error) {
      logger.error('Bulk update tags error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update tags'
      });
    }
  }
}

module.exports = new ImageController();