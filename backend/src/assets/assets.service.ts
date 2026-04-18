import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { AssetCategory } from '../entities/asset-category.entity'
import { Link } from '../entities/link.entity'
import { SharedAsset } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesGateway } from '../messages/messages.gateway'
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto'
import { CreateFileAssetDto } from './dto/create-file-asset.dto'

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(SharedAsset)
    private readonly assetsRepository: Repository<SharedAsset>,
    @InjectRepository(AssetCategory)
    private readonly assetCategoriesRepository: Repository<AssetCategory>,
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
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
      order: { createdAt: 'DESC' },
    })
  }

  async findCategories(familyGroupId?: string): Promise<AssetCategory[]> {
    const normalizedFamilyGroupId =
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.assetCategoriesRepository.find({
      where: normalizedFamilyGroupId ? { familyGroupId: normalizedFamilyGroupId } : {}
    })
  }

  async createCategory(dto: CreateAssetCategoryDto): Promise<AssetCategory> {
    const familyGroup = await this.familyGroupsRepository.findOne({
      where: { id: dto.familyGroupId },
    })

    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${dto.familyGroupId} was not found`)
    }

    const name = dto.name.trim()
    if (!name) {
      throw new BadRequestException('Category name is required')
    }

    const existingCategory = await this.assetCategoriesRepository.findOne({
      where: { familyGroupId: dto.familyGroupId, name },
    })

    if (existingCategory) {
      return existingCategory
    }

    const category = this.assetCategoriesRepository.create({
      familyGroupId: dto.familyGroupId,
      name,
    })

    const savedCategory = await this.assetCategoriesRepository.save(category)
    this.messagesGateway.server
      .to(String(dto.familyGroupId))
      .emit('category-created', savedCategory)

    return savedCategory
  }

  async removeCategory(id: string): Promise<void> {
    const categoryId = Number(id)
    const category = await this.assetCategoriesRepository.findOne({
      where: { id: categoryId },
    })

    if (!category) {
      throw new NotFoundException(`Category with id ${id} was not found`)
    }

    await this.assetsRepository.update(
      {
        familyGroupId: category.familyGroupId,
        categoryName: category.name,
      },
      { categoryName: '' }

    )

    await this.linksRepository.update(
      {
        familyGroupId: category.familyGroupId,
        categoryName: category.name,
      },
      { categoryName: '' },
    )

    await this.assetCategoriesRepository.remove(category)

    this.messagesGateway.server.to(String(category.familyGroupId)).emit('asset-category-updated')
  }

  async createFileAsset(dto: CreateFileAssetDto): Promise<SharedAsset> {
    const familyGroup = await this.familyGroupsRepository.findOne({where: { id: dto.familyGroupId }})

    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${dto.familyGroupId} was not found`)
    }

    const asset = this.assetsRepository.create({
      familyGroupId: dto.familyGroupId,
      storagePath: dto.storagePath,
      fileSize: dto.fileSize,
      categoryName: dto.categoryName?.trim() || undefined,
    })

    const savedAsset = await this.assetsRepository.save(asset)
    this.messagesGateway.server
      .to(String(dto.familyGroupId))
      .emit('asset-created', savedAsset)

    return savedAsset
  }
}
