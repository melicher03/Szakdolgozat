import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { SharedAsset } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesGateway } from '../messages/messages.gateway'
import { CreateFileAssetDto } from './dto/create-file-asset.dto'

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(SharedAsset)
    private readonly assetsRepository: Repository<SharedAsset>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async findAll(familyGroupId?: string): Promise<SharedAsset[]> {
    const normalizedFamilyGroupId =
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.assetsRepository.find({
      where: normalizedFamilyGroupId
        ? { familyGroupId: normalizedFamilyGroupId, storagePath: Not('') }
        : { storagePath: Not('') },
    })
  }

  async createFileAsset(dto: CreateFileAssetDto): Promise<SharedAsset> {
    const familyGroup = await this.familyGroupsRepository.findOne({ where: { id: dto.familyGroupId } })

    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${dto.familyGroupId} was not found`)
    }

    const asset = this.assetsRepository.create({
      familyGroupId: dto.familyGroupId,
      storagePath: dto.storagePath,
      categoryName: dto.categoryName?.trim() || undefined,
    })

    const savedAsset = await this.assetsRepository.save(asset)
    this.messagesGateway.server
      .to(String(dto.familyGroupId))
      .emit('asset-created', savedAsset)

    return savedAsset
  }
}
