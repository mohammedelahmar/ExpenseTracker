import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async (options) => {
  console.log('Attempting to send email to:', options.to);
  
  try {
    // Check if email credentials are set
    // This is a good place to check if the environment variables are set
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.error('Missing email configuration. Check .env file for EMAIL_* variables');
      throw new Error('Email configuration missing');
    }
    
    // Create Gmail-specific transporter
    // Using Gmail SMTP server
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        // This is a workaround for self-signed certificates
        // It is not recommended for production use
        rejectUnauthorized: false
      }
    });
    
    console.log('Email transporter created with credentials for:', process.env.EMAIL_USERNAME);
    
    // Email content
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || ''
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email (DETAILED):', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};