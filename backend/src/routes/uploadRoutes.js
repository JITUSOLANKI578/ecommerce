const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get all uploaded images
router.get('/images', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../src/upload');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Uploads directory not found'
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const images = imageFiles.map(file => ({
      filename: file,
      url: `/uploads/${file}`,
      name: path.basename(file, path.extname(file))
    }));

    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images'
    });
  }
});

// Get images by category (based on filename patterns)
router.get('/images/:category', (req, res) => {
  try {
    const { category } = req.params;
    const uploadsDir = path.join(__dirname, '../../src/upload');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Uploads directory not found'
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    // Filter images based on category (you can adjust this logic)
    const categoryImages = imageFiles
      .filter(file => file.toLowerCase().includes(category.toLowerCase()))
      .map(file => ({
        filename: file,
        url: `/uploads/${file}`,
        name: path.basename(file, path.extname(file))
      }));

    res.json({
      success: true,
      images: categoryImages
    });
  } catch (error) {
    console.error('Error fetching category images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category images'
    });
  }
});

module.exports = router;
