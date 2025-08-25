const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { uploadSingle, uploadMultiple } = require('../middleware/cloudinaryUpload');

// Upload single image to Cloudinary
router.post('/upload/single', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        publicId: publicId,
        secureUrl: req.file.secure_url,
        format: req.file.format,
        width: req.file.width,
        height: req.file.height
      }
    });
  } catch (error) {
    console.error('Error uploading single image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload multiple images to Cloudinary
router.post('/upload/multiple', uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      secureUrl: file.secure_url,
      format: file.format,
      width: file.width,
      height: file.height,
      isPrimary: false
    }));

    // Set first image as primary
    if (uploadedImages.length > 0) {
      uploadedImages[0].isPrimary = true;
    }

    res.json({
      success: true,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// Delete image from Cloudinary
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

// Get image details from Cloudinary
router.get('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching image details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching image details',
      error: error.message
    });
  }
});

// Get optimized image URL
router.get('/optimize/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width = 400, height = 400, quality = 'auto' } = req.query;

    const optimizedUrl = cloudinary.url(publicId, {
      width: parseInt(width),
      height: parseInt(height),
      crop: 'limit',
      quality: quality,
      format: 'auto'
    });

    res.json({
      success: true,
      data: {
        url: optimizedUrl,
        width: parseInt(width),
        height: parseInt(height),
        quality: quality
      }
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing image',
      error: error.message
    });
  }
});

// Get all images from a specific folder
router.get('/folder/:folderName', async (req, res) => {
  try {
    const { folderName } = req.params;
    const {
      limit = 100,
      page = 1,
      sortBy = 'created_at',
      sortOrder = 'desc',
      nextCursor
    } = req.query;

    // Validate folder name
    if (!folderName || folderName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }

    // Build search expression for the specific folder
    const expression = `folder:${folderName}/*`;

    // Search parameters
    const searchParams = {
      expression,
      resource_type: 'image',
      type: 'upload',
      sort_by: [[sortBy, sortOrder]],
      max_results: parseInt(limit),
      next_cursor: nextCursor || undefined
    };

    // Execute search
    const result = await cloudinary.search
      .expression(expression)
      .sort_by(sortBy, sortOrder)
      .max_results(parseInt(limit))
      .execute();

    // Process and enhance results
    const images = result.resources.map(resource => ({
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
      thumbnailUrl: cloudinary.url(resource.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      }),
      mediumUrl: cloudinary.url(resource.public_id, {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto',
        format: 'auto'
      }),
      largeUrl: cloudinary.url(resource.public_id, {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto',
        format: 'auto'
      })
    }));

    res.json({
      success: true,
      data: {
        images,
        totalCount: result.total_count,
        hasMore: !!result.next_cursor,
        nextCursor: result.next_cursor,
        folder: folderName,
        page: parseInt(page),
        limit: parseInt(limit)
      },
      message: `Successfully fetched images from folder: ${folderName}`
    });

  } catch (error) {
    console.error('Error fetching images from folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images from folder',
      error: error.message
    });
  }
});

module.exports = router;
