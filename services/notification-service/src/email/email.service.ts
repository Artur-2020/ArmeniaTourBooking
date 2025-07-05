import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

@Injectable()
export class EmailService {
  private username: string;
  private readonly logger = new AppLogger();

  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get<string>('nodemailerUsername');
    this.logger.setContext('EmailService');
  }

  private transporter = nodemailer.createTransport({
    host: this.configService.get<string>('nodemailerHost'),
    port: this.configService.get<number>('nodemailerPort'),
    secure: true,
    auth: {
      user: this.configService.get<string>('nodemailerUsername'),
      pass: this.configService.get<string>('nodemailerPassword'),
    },
  });

  /**
   * Function for send email with passed data
   * @param to
   * @param subject
   * @param text
   */
  async sendEmail(to: string, subject: string, text: string) {
    const startTime = Date.now();

    try {
      this.logger.log('Starting email send process', {
        to,
        subject,
      });

      const info = await this.transporter.sendMail({
        from: this.username,
        to,
        subject,
        text,
      });

      const duration = Date.now() - startTime;
      this.logger.logEmailSent(to, subject, duration, {
        messageId: info.messageId,
        response: info.response,
      });

      this.logger.log('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
        duration,
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logEmailError(to, subject, error?.message || 'Unknown error', {
        error: error?.message,
        duration,
      });

      throw ErrorHandler.handleEmailError(error, to, subject);
    }
  }

  /**
   * Send email with HTML content
   * @param to
   * @param subject
   * @param html
   */
  async sendHtmlEmail(to: string, subject: string, html: string) {
    const startTime = Date.now();

    try {
      this.logger.log('Starting HTML email send process', {
        to,
        subject,
      });

      const info = await this.transporter.sendMail({
        from: this.username,
        to,
        subject,
        html,
      });

      const duration = Date.now() - startTime;
      this.logger.logEmailSent(to, subject, duration, {
        messageId: info.messageId,
        response: info.response,
        type: 'HTML',
      });

      this.logger.log('HTML email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
        duration,
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logEmailError(to, subject, error?.message || 'Unknown error', {
        error: error?.message,
        duration,
        type: 'HTML',
      });

      throw ErrorHandler.handleEmailError(error, to, subject);
    }
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      this.logger.log('Testing email configuration');
      
      await this.transporter.verify();
      
      this.logger.log('Email configuration is valid');
      
      return {
        success: true,
        message: 'Email configuration is valid',
      };
    } catch (error) {
      this.logger.error('Email configuration test failed', error?.stack, {
        error: error?.message,
      });

      throw ErrorHandler.handleConfigurationError(error);
    }
  }
}
