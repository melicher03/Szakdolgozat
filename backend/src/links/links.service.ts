import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Link } from '../entities/link.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesGateway } from '../messages/messages.gateway'
import { CreateLinkDto } from './dto/create-link.dto'

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async findAll(familyGroupId?: string): Promise<Link[]> {
    const checkedFamilyGroupId = 
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.linksRepository.find({
      where: checkedFamilyGroupId ? { familyGroupId: checkedFamilyGroupId } : {},
    })
  }

  async createLink(dto: CreateLinkDto): Promise<Link> {
    const familyGroup = 
      await this.familyGroupsRepository.findOne({ where: { id: dto.familyGroupId } })
      
    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${dto.familyGroupId} does not exist`)
    }

    const link = this.linksRepository.create({
      familyGroupId: dto.familyGroupId,
      url: dto.url,
      title: dto.title,
      categoryName: dto.categoryName.trim(),
    })

    const savedLink = await this.linksRepository.save(link)
    this.messagesGateway.server
      .to(String(dto.familyGroupId))
      .emit('link-created', savedLink)

    return savedLink
  }
}