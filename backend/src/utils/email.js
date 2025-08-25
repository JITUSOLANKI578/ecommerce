const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Email templates
const emailTemplates = {
  emailVerification: {
    subject: 'Welcome to Ambika - Verify Your Email',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Ambika</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333EA, #EC4899); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #9333EA; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to Ambika!</h1>
          <p>Your destination for exquisite ethnic wear</p>
        </div>
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>Thank you for joining Ambika! We're excited to have you as part of our fashion family.</p>
          <p>To complete your registration and start shopping our beautiful collection, please verify your email address:</p>
          <div style="text-align: center;">
            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${data.verificationUrl}</p>
          <p>This verification link will expire in 24 hours for security reasons.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p>Happy Shopping!<br>Team Ambika</p>
        </div>
        <div class="footer">
          <p>© 2025 Ambika. All rights reserved.</p>
          <p>Follow us on social media for the latest updates!</p>
        </div>
      </body>
      </html>
    `
  },
  
  passwordReset: {
    subject: 'Ambika - Password Reset Request',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Ambika</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333EA, #EC4899); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #9333EA; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔒 Password Reset</h1>
          <p>Secure your Ambika account</p>
        </div>
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>We received a request to reset the password for your Ambika account.</p>
          <p>Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${data.resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This reset link will expire in 1 hour for security</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>
          <p>For security questions, contact our support team.</p>
          <p>Best regards,<br>Team Ambika</p>
        </div>
        <div class="footer">
          <p>© 2025 Ambika. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  },

  orderConfirmation: {
    subject: 'Order Confirmation - Your Ambika Purchase',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Ambika</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333EA, #EC4899); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 15px 0; }
          .item:last-child { border-bottom: none; }
          .total { font-size: 18px; font-weight: bold; color: #9333EA; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for shopping with Ambika</p>
        </div>
        <div class="content">
          <h2>Hi ${data.customerName},</h2>
          <p>Your order has been confirmed and is being processed. Here are your order details:</p>
          
          <div class="order-details">
            <h3>Order #${data.orderNumber}</h3>
            <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString()}</p>
            
            <h4>Items Ordered:</h4>
            ${data.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Size: ${item.selectedSize} | Color: ${item.selectedColor}<br>
                Quantity: ${item.quantity} × ₹${item.price} = ₹${item.totalPrice}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; text-align: right;">
              <p>Subtotal: ₹${data.itemsPrice}</p>
              <p>Shipping: ₹${data.shippingPrice}</p>
              <p class="total">Total: ₹${data.totalPrice}</p>
            </div>
          </div>
          
          <p>We'll send you tracking information once your order ships.</p>
          <p>Thank you for choosing Ambika!</p>
          <p>Team Ambika</p>
        </div>
        <div class="footer">
          <p>© 2025 Ambika. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
exports.sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailHtml = html;
    let emailSubject = subject;

    // Use template if provided
    if (template && emailTemplates[template]) {
      emailHtml = emailTemplates[template].html(data);
      emailSubject = emailTemplates[template].subject;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: emailSubject,
      html: emailHtml,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
    
    return result;

  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send bulk emails
exports.sendBulkEmail = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const email of emails) {
      try {
        const result = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text
        });

        results.push({ success: true, to: email.to, messageId: result.messageId });
        logger.info(`Bulk email sent to ${email.to}: ${result.messageId}`);

      } catch (error) {
        results.push({ success: false, to: email.to, error: error.message });
        logger.error(`Failed to send bulk email to ${email.to}:`, error);
      }
    }

    return results;

  } catch (error) {
    logger.error('Bulk email sending failed:', error);
    throw new Error(`Failed to send bulk emails: ${error.message}`);
  }
};