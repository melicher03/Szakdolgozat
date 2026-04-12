import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedAsset } from '../entities/shared-asset.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesModule } from '../messages/messages.module'
import { LinksController } from './links.controller'
import { LinksService } from './links.service'

@Module({
  imports: [TypeOrmModule.forFeature([SharedAsset, FamilyGroup]), MessagesModule],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}