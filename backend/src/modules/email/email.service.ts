import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"CTN - Critical Thinking Network" <${this.configService.get('SMTP_USER')}>`,
        to: email,
        subject: 'Verify Your Email - CTN',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🧠 Welcome to CTN!</h1>
                  <p>Critical Thinking Network</p>
                </div>
                <div class="content">
                  <h2>Verify Your Email Address</h2>
                  <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
                  </div>
                  
                  <p>Enter this code on the verification page to complete your registration.</p>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    <strong>Note:</strong> If you didn't create an account with CTN, please ignore this email.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Critical Thinking Network. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
