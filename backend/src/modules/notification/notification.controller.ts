import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('page') page: string = '1',
  ) {
    return await this.notificationService.getNotifications(
      req.user.sub,
      parseInt(page),
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') notificationId: string, @Request() req) {
    await this.notificationService.markAsRead(notificationId);
    return { message: 'Notification marked as read' };
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') notificationId: string, @Request() req) {
    await this.notificationService.deleteNotification(notificationId, req.user.sub);
    return { message: 'Notification deleted' };
  }
}
