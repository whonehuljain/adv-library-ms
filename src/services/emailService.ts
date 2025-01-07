import { emailConfig } from '../config/email';

import { CustomError } from '../middlewares/errorHandler';

export class EmailService {
  private static instance: EmailService;
  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: emailConfig.from,
        to,
        subject,
        html,
      };

      await emailConfig.transport.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new CustomError('Failed to send email');
    }
  }

  getVerificationEmailTemplate(name: string, verificationLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Library!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with our library. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 15px 32px; 
                    text-decoration: none; display: inline-block; border-radius: 4px;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
      </div>
    `;
  }

  getWelcomeEmailTemplate(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Library!</h2>
        <p>Hello ${name},</p>
        <p>Your email has been successfully verified. You can now start using our library services.</p>
        <p>Here are some things you can do:</p>
        <ul>
          <li>Browse our collection of books</li>
          <li>Borrow up to 3 books at a time</li>
          <li>Track your borrowed books</li>
          <li>Manage your account settings</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
      </div>
    `;
  }
}
