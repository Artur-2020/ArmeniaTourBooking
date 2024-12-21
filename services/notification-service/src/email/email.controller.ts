import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @EventPattern('send_email')
  async handleEventEmail(
    @Payload() data: { to: string; subject: string; text: string },
  ) {
    await this.emailService.sendEmail(data.to, data.subject, data.text);
    console.log('Email event handled successfully');
  }
}
