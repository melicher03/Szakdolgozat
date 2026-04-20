import { Controller, Get, Query } from '@nestjs/common'
import { MessagesService } from './messages.service'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findByFamilyGroup(@Query('familyGroupId') familyGroupId: string) {
    return this.messagesService.findByFamilyGroup(Number(familyGroupId))
  }
}