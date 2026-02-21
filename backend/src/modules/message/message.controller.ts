import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { MessageService } from './message.service'
import { SendMessageDto } from './dto/send-message.dto'

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.messageService.sendMessage(req.user.userId, dto)
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.messageService.getConversations(req.user.userId)
  }

  @Get('conversation/:userId')
  async getMessages(
    @Request() req,
    @Param('userId') otherUserId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messageService.getMessages(
      req.user.userId,
      otherUserId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    )
  }

  @Post('read/:userId')
  async markAsRead(@Request() req, @Param('userId') otherUserId: string) {
    return this.messageService.markAsRead(req.user.userId, otherUserId)
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.messageService.getUnreadCount(req.user.userId)
  }

  @Delete(':messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.messageService.deleteMessage(req.user.userId, messageId)
  }
}
