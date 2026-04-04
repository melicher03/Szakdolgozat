import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from '../entities/message.entity'
import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto)
    return this.messagesRepository.save(message)
  }

  async findByFamilyGroup(familyGroupId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { familyGroupId },
      order: { createdAt: 'ASC' },
    })
  }

  async findById(id: string): Promise<Message | null> {
    return this.messagesRepository.findOne({ where: { id: Number(id) } })
  }

  async delete(id: string): Promise<void> {
    await this.messagesRepository.delete(id)
  }
}
