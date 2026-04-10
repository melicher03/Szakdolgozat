import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from '../entities/message.entity'
import { MessagesService } from './messages.service'
import { MessagesGateway } from './messages.gateway'
import { MessagesController } from './messages.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
