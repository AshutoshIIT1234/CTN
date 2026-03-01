import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Message } from '../../schemas/message.schema'
import { Conversation } from '../../schemas/conversation.schema'
import { SendMessageDto } from './dto/send-message.dto'

import { SocketGateway } from '../socket/socket.gateway'

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private socketGateway: SocketGateway,
  ) { }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const { receiverId, content } = dto

    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself')
    }

    // Create message
    const message = await this.messageModel.create({
      senderId,
      receiverId,
      content,
    })

    // Update or create conversation
    const participantIds = [senderId, receiverId].sort()

    await this.conversationModel.findOneAndUpdate(
      { participants: participantIds },
      {
        $set: {
          lastMessageId: message._id,
          lastMessageContent: content.substring(0, 100),
          lastMessageAt: message.createdAt,
        },
        $inc: {
          [`unreadCount.${receiverId}`]: 1,
        },
      },
      { upsert: true, new: true }
    )

    // Emit real-time event
    this.socketGateway.sendMessage(receiverId, message)

    return message
  }

  async getConversations(userId: string) {
    const conversations = await this.conversationModel
      .find({
        participants: userId,
      })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'username displayName profilePictureUrl')
      .lean()

    return conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        (p: any) => p._id.toString() !== userId
      )
      // When using .lean(), Map becomes a plain object
      const unreadCountObj = conv.unreadCount as any
      return {
        ...conv,
        otherUser: otherParticipant,
        unreadCount: unreadCountObj?.[userId] || 0,
      }
    })
  }

  async getMessages(userId: string, otherUserId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit

    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'username displayName profilePictureUrl')
      .populate('receiverId', 'username displayName profilePictureUrl')
      .lean()

    const total = await this.messageModel.countDocuments({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })

    return {
      messages: messages.reverse(),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasMore: skip + messages.length < total,
      },
    }
  }

  async markAsRead(userId: string, otherUserId: string) {
    // Mark all messages from otherUser as read
    await this.messageModel.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    )

    // Reset unread count in conversation
    const participantIds = [userId, otherUserId].sort()

    await this.conversationModel.findOneAndUpdate(
      { participants: participantIds },
      {
        $set: {
          [`unreadCount.${userId}`]: 0,
        },
      }
    )

    return { success: true }
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.conversationModel
      .find({
        participants: userId,
      })
      .lean()

    const totalUnread = conversations.reduce((sum, conv) => {
      // When using .lean(), Map becomes a plain object
      const unreadCountObj = conv.unreadCount as any
      return sum + (unreadCountObj?.[userId] || 0)
    }, 0)

    return { unreadCount: totalUnread }
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageModel.findById(messageId)

    if (!message) {
      throw new NotFoundException('Message not found')
    }

    if (message.senderId.toString() !== userId) {
      throw new BadRequestException('You can only delete your own messages')
    }

    await message.deleteOne()
    return { success: true }
  }
}
