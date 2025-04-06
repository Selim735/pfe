// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    try {
      const resetLink = `http://localhost:3000/reset-password?token=${token}`;
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject: 'Réinitialisation du mot de passe',
        html: `
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetLink}">Réinitialiser le mot de passe</a>
          <p>Ce lien est valide pendant 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Reset password email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${to}`, error.stack);
      throw new Error('Failed to send reset password email');
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    try {
      const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject: 'Email Verification',
        html: `
          <p>Hello,</p>
          <p>Thank you for registering. Please click the link below to verify your email:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>The link is valid for 1 hour.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error.stack);
      throw new Error('Failed to send verification email');
    }
  }
}