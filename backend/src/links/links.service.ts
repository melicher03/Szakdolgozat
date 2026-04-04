import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SharedAsset, SharedAssetType } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { CreateLinkDto } from './dto/create-link.dto'

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(SharedAsset)
    private readonly assetsRepository: Repository<SharedAsset>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
  ) {}

  async findAll(familyGroupId?: string): Promise<SharedAsset[]> {
    const checkedFamilyGroupId = 
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.assetsRepository.find({
      where: {
        type: SharedAssetType.URL,
        ...(checkedFamilyGroupId ? { familyGroupId: checkedFamilyGroupId } : {}),
      },
      order: { createdAt: 'DESC' },
    })
  }

  async createLink(dto: CreateLinkDto): Promise<SharedAsset> {
    const familyGroup = 
      await this.familyGroupsRepository.findOne({ where: { id: dto.familyGroupId } })
      
    if (!familyGroup) {
      throw new BadRequestException(`Family group with id ${dto.familyGroupId} does not exist`)
    }

    const asset = this.assetsRepository.create({
      type: SharedAssetType.URL,
      familyGroupId: dto.familyGroupId,
      url: dto.url,
      title: dto.title,
      uploadedBy: dto.uploadedBy,
    })

    return this.assetsRepository.save(asset)
  }
}