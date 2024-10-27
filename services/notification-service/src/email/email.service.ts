import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private username: string;
  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get<string>('nodemailerUsername');
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

  async sendEmail(to: string, subject: string, text: string) {
    const info = await this.transporter.sendMail({
      from: this.username,
      to,
      subject,
      text,
    });

    console.log('Message sent: %s', info.messageId);
  }
}
