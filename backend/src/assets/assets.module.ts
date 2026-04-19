import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedAsset } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesModule } from '../messages/messages.module'
import { AssetsController } from './assets.controller'
import { AssetsService } from './assets.service'

@Module({
  imports: [TypeOrmModule.forFeature([SharedAsset, FamilyGroup]), MessagesModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
