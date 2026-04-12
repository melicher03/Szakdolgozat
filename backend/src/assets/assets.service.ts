import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AssetCategory } from '../entities/asset-category.entity'
import { SharedAsset, SharedAssetType } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto'
import { CreateFileAssetDto } from './dto/create-file-asset.dto'

@Injectable()
export class AssetsService {
  private readonly supabase: SupabaseClient | null
  private readonly storageBucket: string

  constructor(
    @InjectRepository(SharedAsset)
    private readonly assetsRepository: Repository<SharedAsset>,
    @InjectRepository(AssetCategory)
    private readonly assetCategoriesRepository: Repository<AssetCategory>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    this.supabase =
      supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null
    this.storageBucket = 'media'
  }

  async findAll(familyGroupId?: string): Promise<SharedAsset[]> {
    const normalizedFamilyGroupId =
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.assetsRepository.find({
      where: normalizedFamilyGroupId ? { familyGroupId: normalizedFamilyGroupId } : {},
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

    return this.assetCategoriesRepository.save(category)
  }

  async createFileAsset(dto: CreateFileAssetDto): Promise<SharedAsset> {
    const familyGroup =
      await this.familyGroupsRepository.findOne({ where: { id: dto.familyGroupId } })

    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${dto.familyGroupId} was not found`)
    }

    const asset = this.assetsRepository.create({
      type: SharedAssetType.FILE,
      familyGroupId: dto.familyGroupId,
      title: dto.title,
      url: dto.url,
      storagePath: dto.storagePath,
      fileSize: dto.fileSize,
      uploadedBy: dto.uploadedBy,
      categoryName: dto.categoryName.trim(),
    })

    return this.assetsRepository.save(asset)
  }

  async remove(id: string): Promise<void> {
    const asset = await this.assetsRepository.findOne({ where: { id } })
    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} was not found`)
    }

    if (asset.type === SharedAssetType.FILE && asset.storagePath) {
      const supabase = this.supabase
      if (!supabase) {
        throw new InternalServerErrorException('Supabase client is not configured')
      }
      const { error } = await supabase.storage.from(this.storageBucket).remove([asset.storagePath])
      if (error) {
        throw new InternalServerErrorException(`Supabase remove failed: ${error.message}`)
      }
    }

    await this.assetsRepository.remove(asset)
  }
}
