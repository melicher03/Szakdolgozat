import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway {
  @WebSocketServer()
  server: Server

  constructor(private messagesService: MessagesService) {}

  @SubscribeMessage('join-group')
  handleJoinGroup(
    @MessageBody() data: { familyGroupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.familyGroupId)
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() dto: CreateMessageDto,
  ) {
    const message = await this.messagesService.create(dto)
    this.server.to(dto.familyGroupId).emit('receive-message', message)
  }

  @SubscribeMessage('leave-group')
  handleLeaveGroup(
    @MessageBody() data: { familyGroupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.familyGroupId)
  }
}
