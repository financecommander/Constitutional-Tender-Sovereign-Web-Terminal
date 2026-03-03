import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test')
  async sendTestEmail(@Body() body: { to: string; subject: string; message: string }) {
    const result = await this.notificationsService.send({
      to: body.to,
      subject: body.subject,
      html: `<p>${body.message}</p>`,
      text: body.message,
    });
    return { sent: result };
  }
}
