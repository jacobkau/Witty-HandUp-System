import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const emailjs = require('@emailjs/nodejs');

/**
 * Sends a clean, plain-text email via EmailJS.
 * @param {string} toEmail - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} messageText - The plain text body of the email
 */
export const sendEmail = async (toEmail, subject, messageText) => {
  try {
    const templateParams = {
      to_email: toEmail,
      from_name: 'Witty HandUp Notifications',
      subject: subject,       
      message: messageText, 
    };

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
    console.error('EmailJS Error:', err);
  }
};
