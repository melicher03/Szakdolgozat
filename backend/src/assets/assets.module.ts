import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssetCategory } from '../entities/asset-category.entity'
import { SharedAsset } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { AssetsController } from './assets.controller'
import { AssetsService } from './assets.service'

@Module({
  imports: [TypeOrmModule.forFeature([SharedAsset, FamilyGroup, AssetCategory])],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
