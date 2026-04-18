import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Link } from '../entities/link.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { MessagesModule } from '../messages/messages.module'
import { LinksController } from './links.controller'
import { LinksService } from './links.service'

@Module({
  imports: [TypeOrmModule.forFeature([Link, FamilyGroup]), MessagesModule],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}