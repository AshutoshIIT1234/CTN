import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MessageController } from './message.controller'
import { MessageService } from './message.service'
import { Message, MessageSchema } from '../../schemas/message.schema'
import { Conversation, ConversationSchema } from '../../schemas/conversation.schema'
import { SocketModule } from '../socket/socket.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    SocketModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule { }
