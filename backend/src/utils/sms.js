const admin = require('firebase-admin');
const { logger } = require('./logger');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin:', error);
  }
}

// Send SMS using Firebase
exports.sendSMS = async (phoneNumber, message) => {
  try {
    // Format phone number for Firebase (should include country code)
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    
    // In production, you would use Firebase Auth to send SMS
    // For now, we'll simulate SMS sending and log it
    logger.info(`SMS would be sent to ${formattedPhone}: ${message}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      phoneNumber: formattedPhone,
      message: 'SMS sent successfully'
    };

  } catch (error) {
    logger.error('SMS sending failed:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Send OTP via Firebase Authentication
exports.sendOTP = async (phoneNumber) => {
  try {
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, use Firebase Auth's phone authentication
    // This is a simplified version for demonstration
    const message = `Your Ambika verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    
    await exports.sendSMS(formattedPhone, message);
    
    logger.info(`OTP sent to ${formattedPhone}`);
    
    return {
      success: true,
      otp, // In production, don't return OTP in response
      phoneNumber: formattedPhone
    };

  } catch (error) {
    logger.error('OTP sending failed:', error);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Verify OTP (simplified version)
exports.verifyOTP = async (phoneNumber, otp) => {
  try {
    // In production, verify OTP with Firebase Auth
    // This is a simplified version
    logger.info(`OTP verification attempted for ${phoneNumber}: ${otp}`);
    
    // Simulate verification (always return true for demo)
    return {
      success: true,
      message: 'OTP verified successfully'
    };

  } catch (error) {
    logger.error('OTP verification failed:', error);
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};

// Send order notifications
exports.sendOrderNotification = async (phoneNumber, orderData) => {
  try {
    const { orderNumber, status, customerName } = orderData;
    
    let message;
    switch (status) {
      case 'confirmed':
        message = `Hi ${customerName}, your Ambika order ${orderNumber} has been confirmed! Track your order at ambika.com/track`;
        break;
      case 'shipped':
        message = `Great news ${customerName}! Your Ambika order ${orderNumber} has been shipped. You'll receive it soon!`;
        break;
      case 'delivered':
        message = `Your Ambika order ${orderNumber} has been delivered! Hope you love your new ethnic wear. Rate your experience!`;
        break;
      default:
        message = `Your Ambika order ${orderNumber} status: ${status}. Check ambika.com for details.`;
    }
    
    await exports.sendSMS(phoneNumber, message);
    
    logger.info(`Order notification sent to ${phoneNumber} for order ${orderNumber}`);
    
    return {
      success: true,
      message: 'Order notification sent successfully'
    };

  } catch (error) {
    logger.error('Order notification failed:', error);
    throw new Error(`Failed to send order notification: ${error.message}`);
  }
};