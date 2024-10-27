import { Body, Controller, Logger, Post } from '@nestjs/common';
import { NotificationDto } from '@shared/types/notification-alert';
import { NotificationService } from '../telegram/service/notification/notification.service';

@Controller('notification')
export class NotificationController {

  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly notificationService: NotificationService) {
  }

  @Post()
  async sendNotification(@Body() notification: NotificationDto) {
    this.logger.log(`Received notification from stream token: ${JSON.stringify(notification)}`);
    await this.notificationService.handleNotificationFromStream(notification);
    return
  }
}