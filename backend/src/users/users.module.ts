import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FamilyGroup } from '../entities/family-group.entity'
import { Message } from '../entities/message.entity'
import { SharedAsset } from '../entities/shared-asset.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([FamilyGroup, Message, SharedAsset])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}