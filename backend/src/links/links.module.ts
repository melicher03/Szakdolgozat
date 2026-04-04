import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedAsset } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { LinksController } from './links.controller'
import { LinksService } from './links.service'

@Module({
  imports: [TypeOrmModule.forFeature([SharedAsset, FamilyGroup])],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}