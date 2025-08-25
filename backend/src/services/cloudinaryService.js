const cloudinary = require('cloudinary').v2;
// const { getRedisClient } = require('../../config/redis');
const { logger } = require('../utils/logger');

class CloudinaryService {
  constructor() {
    this.cacheExpiry = 3600; // 1 hour
  }

  /**
   * Get images by folder/category with advanced filtering
   */
  async getImagesByCategory(category, options = {}) {
    try {
      const {
        limit = 50,
        page = 1,
        sortBy = 'created_at',
        sortOrder = 'desc',
        tags = [],
        resourceType = 'image',
        format = null,
        transformation = null
      } = options;

      const cacheKey = `cloudinary:${category}:${JSON.stringify(options)}`;

  
      // Build search expression - handle different folder structures
      let expression;

      // Check if the category is a specific folder or needs to search in multiple locations
      if (category === 'assets' || category === 'images') {
        // For assets and images folders, search in the main folder and any subfolders
        expression = `folder=${category} OR folder:${category}/*`;
      } else {
        // For other categories, use the standard folder search
        expression = `folder:${category}/*`;
      }

      if (tags.length > 0) {
        const tagExpression = tags.map(tag => `tags=${tag}`).join(' AND ');
        expression += ` AND ${tagExpression}`;
      }

      if (format) {
        expression += ` AND format=${format}`;
      }

      logger.info(`Cloudinary search expression: ${expression}`);
      logger.info(`Searching for images in category: ${category}`);

      // Execute search with proper error handling
      let result;
      try {
        result = await cloudinary.search
          .expression(expression)
          .sort_by(sortBy, sortOrder)
          .max_results(limit)
          .execute();

        logger.info(`Cloudinary search successful. Found ${result.resources?.length || 0} images`);
      } catch (searchError) {
        logger.error(`Cloudinary search failed for expression: ${expression}`, searchError);

        // Try alternative search patterns if the first one fails
        if (category === 'assets' || category === 'images') {
          logger.info(`Trying alternative search pattern for ${category}`);
          const altExpression = `folder:${category}`;
          result = await cloudinary.search
            .expression(altExpression)
            .sort_by(sortBy, sortOrder)
            .max_results(limit)
            .execute();
        } else {
          throw searchError;
        }
      }

      // Handle case where no images are found
      if (!result.resources || result.resources.length === 0) {
        logger.warn(`No images found for category: ${category}`);
        return {
          images: [],
          totalCount: 0,
          hasMore: false,
          nextCursor: null,
          category,
          page,
          limit
        };
      }

      // Process and enhance results
      const processedImages = result.resources.map(resource => ({
        id: resource.public_id,
        url: resource.secure_url,
        originalUrl: resource.url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        size: resource.bytes,
        folder: resource.folder,
        filename: resource.filename,
        tags: resource.tags || [],
        createdAt: resource.created_at,
        updatedAt: resource.uploaded_at,
        // Generate optimized URLs for different use cases
        thumbnailUrl: this.generateOptimizedUrl(resource.public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          format: 'auto'
        }),
        mediumUrl: this.generateOptimizedUrl(resource.public_id, {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          format: 'auto'
        }),
        largeUrl: this.generateOptimizedUrl(resource.public_id, {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
          format: 'auto'
        }),
        // Responsive URLs for different screen sizes
        responsiveUrls: {
          mobile: this.generateOptimizedUrl(resource.public_id, {
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          }),
          tablet: this.generateOptimizedUrl(resource.public_id, {
            width: 600,
            height: 600,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          }),
          desktop: this.generateOptimizedUrl(resource.public_id, {
            width: 800,
            height: 800,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          })
        }
      }));

      const response = {
        images: processedImages,
        totalCount: result.total_count || processedImages.length,
        hasMore: !!result.next_cursor,
        nextCursor: result.next_cursor,
        category,
        page,
        limit
      };

      // Cache the result
      // if (this.redis) {
      //   await this.redis.setex(cacheKey, this.cacheExpiry, JSON.stringify(response));
      //   logger.info(`Cached images for category: ${category}`);
      // }

      return response;

    } catch (error) {
      logger.error(`Error fetching images for category ${category}:`, error);

      // Provide more detailed error information
      if (error.message.includes('Invalid expression')) {
        throw new Error(`Invalid search expression for category: ${category}. Please check the folder structure in Cloudinary.`);
      } else if (error.message.includes('401')) {
        throw new Error('Cloudinary authentication failed. Please check your API credentials.');
      } else if (error.message.includes('404')) {
        throw new Error(`Category "${category}" not found in Cloudinary.`);
      } else {
        throw new Error(`Failed to fetch images for category: ${category}. ${error.message}`);
      }
    }
  }

  /**
   * Get all available categories/folders
   */
  async getCategories() {
    try {
      const cacheKey = 'cloudinary:categories';

      // if (this.redis) {
      //   const cached = await this.redis.get(cacheKey);
      //   if (cached) {
      //     return JSON.parse(cached);
      //   }
      // }

      const result = await cloudinary.api.root_folders();
      const categories = result.folders.map(folder => ({
        name: folder.name,
        path: folder.path,
        displayName: this.formatCategoryName(folder.name)
      }));

      // Get subcategories for each main category
      const categoriesWithSubfolders = await Promise.all(
        categories.map(async (category) => {
          try {
            const subfolders = await cloudinary.api.sub_folders(category.path);
            return {
              ...category,
              subcategories: subfolders.folders.map(subfolder => ({
                name: subfolder.name,
                path: subfolder.path,
                displayName: this.formatCategoryName(subfolder.name)
              }))
            };
          } catch (error) {
            return { ...category, subcategories: [] };
          }
        })
      );

      // if (this.redis) {
      //   await this.redis.setex(cacheKey, this.cacheExpiry * 2, JSON.stringify(categoriesWithSubfolders));
      // }

      return categoriesWithSubfolders;

    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get images by tags
   */
  async getImagesByTags(tags, options = {}) {
    try {
      const { limit = 50, category = null } = options;
      const cacheKey = `cloudinary:tags:${tags.join(',')}:${category || 'all'}`;

      // if (this.redis) {
      //   const cached = await this.redis.get(cacheKey);
      //   if (cached) {
      //     return JSON.parse(cached);
      //   }
      // }

      let expression = tags.map(tag => `tags:${tag}`).join(' AND ');
      if (category) {
        expression += ` AND folder:${category}/*`;
      }

      const result = await cloudinary.search
        .expression(expression)
        .sort_by('created_at', 'desc')
        .max_results(limit)
        .execute();

      const processedImages = result.resources.map(resource => ({
        id: resource.public_id,
        url: resource.secure_url,
        thumbnailUrl: this.generateOptimizedUrl(resource.public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto'
        }),
        tags: resource.tags || [],
        folder: resource.folder
      }));

      const response = {
        images: processedImages,
        totalCount: result.total_count,
        tags,
        category
      };

      // if (this.redis) {
      //   await this.redis.setex(cacheKey, this.cacheExpiry, JSON.stringify(response));
      // }

      return response;

    } catch (error) {
      logger.error('Error fetching images by tags:', error);
      throw new Error('Failed to fetch images by tags');
    }
  }

  /**
   * Search images across all categories
   */
  async searchImages(query, options = {}) {
    try {
      const { limit = 20, category = null } = options;

      let expression = `filename:*${query}* OR tags:*${query}*`;
      if (category) {
        expression += ` AND folder:${category}/*`;
      }

      const result = await cloudinary.search
        .expression(expression)
        .sort_by('created_at', 'desc')
        .max_results(limit)
        .execute();

      return {
        images: result.resources.map(resource => ({
          id: resource.public_id,
          url: resource.secure_url,
          thumbnailUrl: this.generateOptimizedUrl(resource.public_id, {
            width: 300,
            height: 300,
            crop: 'fill'
          }),
          folder: resource.folder,
          filename: resource.filename,
          tags: resource.tags || []
        })),
        query,
        totalCount: result.total_count
      };

    } catch (error) {
      logger.error('Error searching images:', error);
      throw new Error('Failed to search images');
    }
  }

  /**
   * Generate optimized URL with transformations
   */
  generateOptimizedUrl(publicId, transformations = {}) {
    try {
      // Remove file extension if present
      return cloudinary.url(publicId, {
        ...transformations,
        secure: true,
        fetch_format: 'auto',
        quality: 'auto'
      });
    } catch (error) {
      logger.error('Error generating optimized URL:', error);
      return null;
    }
  }

  /**
   * Get image details by public ID
   */
  async getImageDetails(publicId) {
    try {
      const cacheKey = `cloudinary:image:${publicId}`;

      // if (this.redis) {
      //   const cached = await this.redis.get(cacheKey);
      //   if (cached) {
      //     return JSON.parse(cached);
      //   }
      // }

      const result = await cloudinary.api.resource(publicId, {
        colors: true,
        faces: true,
        quality_analysis: true,
        accessibility_analysis: true
      });

      const imageDetails = {
        id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        folder: result.folder,
        tags: result.tags || [],
        colors: result.colors || [],
        faces: result.faces || [],
        qualityAnalysis: result.quality_analysis || {},
        accessibilityAnalysis: result.accessibility_analysis || {},
        createdAt: result.created_at,
        updatedAt: result.uploaded_at
      };

      // if (this.redis) {
      //   await this.redis.setex(cacheKey, this.cacheExpiry, JSON.stringify(imageDetails));
      // }

      return imageDetails;

    } catch (error) {
      logger.error(`Error fetching image details for ${publicId}:`, error);
      throw new Error('Failed to fetch image details');
    }
  }

  /**
   * Upload image to specific category
   */
  async uploadImage(file, category, options = {}) {
    try {
      const { tags = [], filename = null } = options;

      const uploadOptions = {
        folder: category,
        tags: [...tags, category],
        resource_type: 'auto',
        quality: 'auto',
        format: 'auto'
      };

      if (filename) {
        uploadOptions.public_id = `${category}/${filename}`;
      }

      const result = await cloudinary.uploader.upload(file, uploadOptions);

      // Clear category cache
      // if (this.redis) {
      //   const pattern = `cloudinary:${category}:*`;
      //   const keys = await this.redis.keys(pattern);
      //   if (keys.length > 0) {
      //     await this.redis.del(keys);
      //   }
      // }

      return {
        id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        folder: result.folder,
        tags: result.tags
      };

    } catch (error) {
      logger.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete image
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      // Clear related caches
      // if (this.redis) {
      //   const keys = await this.redis.keys(`cloudinary:*`);
      //   if (keys.length > 0) {
      //     await this.redis.del(keys);
      //   }
      // }

      return result;

    } catch (error) {
      logger.error(`Error deleting image ${publicId}:`, error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Helper methods
   */
  formatCategoryName(name) {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  async getNextCursor(category, page) {
    // Implementation for pagination cursor
    // This would typically be stored in cache or database
    return null;
  }

  /**
   * Bulk operations
   */
  async bulkUpdateTags(publicIds, tags) {
    try {
      const result = await cloudinary.api.update(publicIds, {
        tags: tags
      });

      // Clear caches
      // if (this.redis) {
      //   await this.redis.flushdb();
      // }

      return result;

    } catch (error) {
      logger.error('Error bulk updating tags:', error);
      throw new Error('Failed to bulk update tags');
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    try {
      const cacheKey = 'cloudinary:usage:stats';

      // if (this.redis) {
      //   const cached = await this.redis.get(cacheKey);
      //   if (cached) {
      //     return JSON.parse(cached);
      //   }
      // }

      const usage = await cloudinary.api.usage();
      const stats = {
        totalResources: usage.resources,
        totalStorage: usage.storage,
        totalBandwidth: usage.bandwidth,
        totalTransformations: usage.transformations,
        plan: usage.plan,
        lastUpdated: new Date().toISOString()
      };

      // if (this.redis) {
      //   await this.redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 minutes cache
      // }

      return stats;

    } catch (error) {
      logger.error('Error fetching usage stats:', error);
      throw new Error('Failed to fetch usage statistics');
    }
  }
}

module.exports = new CloudinaryService();
