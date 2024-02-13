import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async sendMail() {
    return await this.appService.sendEmail({
      from: 'user@email.com',
      to: 'admin@email.com',
      subject: 'hey there',
      text: 'hey there',
    });
  }
}
