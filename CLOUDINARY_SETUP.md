# Cloudinary Integration Setup Guide

## Overview
This guide explains how to set up Cloudinary for image management in your Ecommerce Navratri project.

## Prerequisites
- Cloudinary account (free tier available at https://cloudinary.com)
- Node.js and npm installed
- MongoDB running

## Backend Setup

### 1. Environment Variables
Add these variables to your backend `.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 2. Installation
Cloudinary dependencies are already installed:
- `cloudinary`: Cloudinary SDK
- `multer`: File upload middleware
- `multer-storage-cloudinary`: Cloudinary storage for multer

### 3. Backend Files Created
- `backend/src/config/cloudinary.js`: Cloudinary configuration
- `backend/src/middleware/cloudinaryUpload.js`: Upload middleware
- `backend/src/routes/cloudinaryRoutes.js`: Cloudinary API endpoints
- `backend/src/utils/imageOptimizer.js`: Image optimization utilities
- `backend/src/scripts/migrateToCloudinary.js`: Migration script

### 4. API Endpoints
- `POST /api/cloudinary/upload/single`: Upload single image
- `POST /api/cloudinary/upload/multiple`: Upload multiple images
- `DELETE /api/cloudinary/delete/:publicId`: Delete image
- `GET /api/cloudinary/image/:publicId`: Get image details
- `GET /api/cloudinary/optimize/:publicId`: Get optimized image URL

## Frontend Setup

### 1. Environment Variables
Add these variables to your frontend `.env` file:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

### 2. Installation
Frontend Cloudinary dependencies are already installed:
- `@cloudinary/url-gen`: Cloudinary URL generation
- `@cloudinary/react`: React components

### 3. Frontend Files Created
- `src/utils/cloudinaryConfig.ts`: Cloudinary configuration
- `src/components/common/CloudinaryImage.tsx`: Reusable image component

## Usage Examples

### Backend Usage
```javascript
// Upload single image
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'ecommerce-navratri/products',
  transformation: [
    { width: 800, height: 800, crop: 'limit' },
    { quality: 'auto' }
  ]
});

// Get optimized image URL
const optimizedUrl = getOptimizedImageUrl(publicId, {
  width: 400,
  height: 400,
  crop: 'fill'
});
```

### Frontend Usage
```javascript
// Using the CloudinaryImage component
import CloudinaryImage from '../common/CloudinaryImage';

<CloudinaryImage
  publicId="ecommerce-navratri/products/sample-product"
  alt="Product name"
  width={400}
  height={400}
  crop="fill"
  className="w-full h-64 object-cover"
/>

// Using the utility functions
import { getOptimizedImage } from '../utils/cloudinaryConfig';
const imageUrl = getOptimizedImage(publicId, { width: 300, height: 300 }).toURL();
```

## Migration Steps

### 1. Upload Sample Images
First, upload sample images to Cloudinary using the dashboard or API.

### 2. Update Product Images
Run the migration script:
```bash
cd backend
node src/scripts/migrateToCloudinary.js
```

### 3. Update Frontend Components
Replace all local image URLs with Cloudinary URLs:
- Update product images
- Update category images
- Update banner images

## Image Organization Structure
```
ecommerce-navratri/
├── products/
│   ├── lehengas/
│   ├── chaniya-choli/
│   ├── gowns/
│   ├── sarees/
│   ├── kurta-sets/
│   └── accessories/
├── categories/
├── banners/
└── thumbnails/
```

## Best Practices

### 1. Image Optimization
- Use responsive images for different screen sizes
- Implement lazy loading for better performance
- Use appropriate image formats (WebP when supported)

### 2. Naming Conventions
- Use descriptive names: `product-name-color-view.jpg`
- Include category in path: `ecommerce-navratri/products/lehengas/`
- Use consistent naming across all images

### 3. Security
- Never expose API secrets in frontend code
- Use signed URLs for sensitive images
- Implement proper access controls

## Troubleshooting

### Common Issues

1. **Images not loading**
   - Check Cloudinary credentials
   - Verify image public IDs
   - Check CORS settings

2. **Upload failures**
   - Check file size limits (5MB default)
   - Verify file formats (jpg, jpeg, png, webp, gif)
   - Check Cloudinary account limits

3. **Performance issues**
   - Use image optimization
   - Implement lazy loading
   - Use CDN for global distribution

## Testing

### Backend Testing
```bash
# Test upload endpoint
curl -X POST http://localhost:5000/api/cloudinary/upload/single \
  -F "image=@test-image.jpg"

# Test optimized image
curl http://localhost:5000/api/cloudinary/optimize/sample-image
```

### Frontend Testing
- Check image loading in browser
- Verify responsive images work
- Test lazy loading functionality

## Support
For issues or questions, please check:
- Cloudinary documentation: https://cloudinary.com/documentation
- Project issues: Create GitHub issue
- Community support: Cloudinary community forums
