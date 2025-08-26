# Environment Variables Setup Guide

## Overview
This document provides a comprehensive guide for setting up environment variables for the Ecommerce Navratri project.

## Required Environment Variables

### 1. Database Configuration
- **MONGODB_URI**: MongoDB connection string
  - Format: `mongodb://username:password@host:port/database`
  - Example: `mongodb://localhost:27017/ecommerce_navratri`

### 2. Redis Configuration
- **REDIS_HOST**: Redis server hostname
- **REDIS_PORT**: Redis server port (default: 6379)
- **REDIS_PASSWORD**: Redis authentication password (if required)

### 3. Firebase Configuration
Required for authentication and Firebase services:
- **FIREBASE_PROJECT_ID**: Your Firebase project ID
- **FIREBASE_PRIVATE_KEY_ID**: Private key ID from Firebase service account
- **FIREBASE_PRIVATE_KEY**: Private key from Firebase service account
- **FIREBASE_CLIENT_EMAIL**: Client email from Firebase service account
- **FIREBASE_CLIENT_ID**: Client ID from Firebase service account

### 4. JWT Configuration
- **JWT_SECRET**: Secret key for JWT token generation
- **JWT_REFRESH_SECRET**: Secret key for JWT refresh tokens

### 5. Email Configuration (SMTP)
- **EMAIL_HOST**: SMTP server host (e.g., smtp.gmail.com)
- **EMAIL_PORT**: SMTP server port (e.g., 587 for TLS)
- **EMAIL_USER**: Email address for sending emails
- **EMAIL_PASS**: App password or SMTP password

### 6. Cloudinary Configuration
Required for image upload and management:
- **CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name
- **CLOUDINARY_API_KEY**: Your Cloudinary API key
- **CLOUDINARY_API_SECRET**: Your Cloudinary API secret

### 7. Frontend Configuration
- **VITE_API_URL**: Backend API URL for frontend requests
  - Example: `http://localhost:5000/api`

### 8. Payment Gateway (Razorpay)
- **RAZORPAY_KEY_ID**: Razorpay API key ID
- **RAZORPAY_KEY_SECRET**: Razorpay API key secret

### 9. Elasticsearch Configuration
- **ELASTICSEARCH_HOST**: Elasticsearch server URL
- **ELASTICSEARCH_USERNAME**: Elasticsearch username
- **ELASTICSEARCH_PASSWORD**: Elasticsearch password

### 10. Application Settings
- **NODE_ENV**: Environment mode (`development`/`production`)
- **PORT**: Backend server port (default: 5000)
- **FRONTEND_URL**: Frontend application URL

## Setup Instructions

### 1. Copy the Template
```bash
cp .env.example .env
```

### 2. Configure Your Variables
Edit the `.env` file and replace all placeholder values with your actual configuration.

### 3. Required Services Setup

#### MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` with your connection string

#### Redis
- Install Redis server locally or use cloud Redis service
- Update Redis configuration variables

#### Firebase
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Copy the values to your environment variables

#### Cloudinary
1. Sign up at cloudinary.com
2. Get your cloud name, API key, and API secret from dashboard
3. Update Cloudinary variables

#### Email (Gmail Example)
1. Enable 2-factor authentication on Gmail
2. Generate app password
3. Use app password in `EMAIL_PASS`

#### Razorpay
1. Create account at razorpay.com
2. Get API keys from dashboard
3. Update Razorpay variables

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:3000
```

### Production
```env
NODE_ENV=production
PORT=5000
VITE_API_URL=https://your-domain.com/api
FRONTEND_URL=https://your-domain.com
```

## Security Notes

1. **Never commit `.env` file** to version control
2. Use strong, unique passwords for all services
3. Rotate secrets regularly in production
4. Use different configurations for development and production
5. Consider using environment variable management tools for production

## Troubleshooting

If you encounter issues:
1. Verify all required variables are set
2. Check service connections (MongoDB, Redis, etc.)
3. Ensure ports are not blocked by firewall
4. Verify API keys and secrets are correct

## Additional Resources

- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup)
- [Cloudinary Setup](https://cloudinary.com/documentation/how_to_integrate_cloudinary)
- [Razorpay API Documentation](https://razorpay.com/docs/api/)
