import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssetCategory } from '../entities/asset-category.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { Link } from '../entities/link.entity'
import { SharedAsset } from '../entities/shared-asset.entity'
import { MessagesModule } from '../messages/messages.module'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetCategory, SharedAsset, Link, FamilyGroup]),
    MessagesModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
