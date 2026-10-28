import { createRequire } from 'module';

// Create a require function that works in ES modules
const require = createRequire(import.meta.url);

// Load EmailJS using CommonJS to bypass the Node v22 ESM bug
const emailjs = require('@emailjs/nodejs');

/**
 * Reusable function to send HTML emails via EmailJS
 * @param {string} toEmail - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - The inner HTML content of the email
 */
export const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    // Wrap the specific message in your brand's master layout
    const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">💁 Witty HandUp System</h1>
        </div>

        <!-- Dynamic Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff; color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${htmlContent}
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Witty Highbrow Technologies. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const templateParams = {
      to_email: toEmail,
      from_name: 'Witty HandUp Notifications',
      subject: subject,       
      message: htmlMessage, 
    };

    // Send via EmailJS
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log(`Email sent to ${toEmail}:`, response.status);
  } catch (err) {
    // We catch the error so it doesn't crash the API request if email fails
    console.error('EmailJS Error:', err);
  }
};
