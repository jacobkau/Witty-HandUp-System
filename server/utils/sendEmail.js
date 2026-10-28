import emailjs from '@emailjs/nodejs';

/**
 * Reusable function to send HTML emails via EmailJS
 * @param {string} toEmail - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - The inner HTML content of the email
 */
export const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;"> Witty HandUp System</h1>
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
