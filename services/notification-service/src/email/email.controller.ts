import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @MessagePattern({ cmd: 'send_email' })
  async handleSendEmail(
    @Payload() data: { to: string; subject: string; text: string },
  ) {
    console.log('asklakslkalksa');
    await this.emailService.sendEmail(data.to, data.subject, data.text);
  }
}
