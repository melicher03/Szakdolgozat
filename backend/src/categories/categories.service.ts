import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateCategoryDto } from './dto/create-category.dto'
import { AssetCategory } from '../entities/asset-category.entity'
import { SharedAsset } from '../entities/shared-asset.entity'
import { Link } from '../entities/link.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesGateway } from '../messages/messages.gateway'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(AssetCategory)
    private readonly categoriesRepository: Repository<AssetCategory>,
    @InjectRepository(SharedAsset)
    private readonly assetsRepository: Repository<SharedAsset>,
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async findAll(familyGroupId?: string): Promise<AssetCategory[]> {
    const normalizedFamilyGroupId =
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.categoriesRepository.find({
      where: normalizedFamilyGroupId ? { familyGroupId: normalizedFamilyGroupId } : {},
    })
  }

  async create(dto: CreateCategoryDto): Promise<AssetCategory> {
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

    const existingCategory = await this.categoriesRepository.findOne({
      where: { familyGroupId: dto.familyGroupId, name },
    })

    if (existingCategory) {
      return existingCategory
    }

    const category = this.categoriesRepository.create({
      familyGroupId: dto.familyGroupId,
      name,
    })

    const savedCategory = await this.categoriesRepository.save(category)
    this.messagesGateway.server
      .to(String(dto.familyGroupId))
      .emit('category-created', savedCategory)

    return savedCategory
  }

  async remove(id: string): Promise<void> {
    const categoryId = Number(id)
    const category = await this.categoriesRepository.findOne({
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
      { categoryName: '' },
    )

    await this.linksRepository.update(
      {
        familyGroupId: category.familyGroupId,
        categoryName: category.name,
      },
      { categoryName: '' },
    )

    await this.categoriesRepository.remove(category)

    this.messagesGateway.server.to(String(category.familyGroupId)).emit('asset-category-updated')
  }
}
