import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyGroup } from '../entities/family-group.entity';
import { FamilyGroupsController } from './family-groups.controller';
import { FamilyGroupsService } from './family-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyGroup])],
  controllers: [FamilyGroupsController],
  providers: [FamilyGroupsService],
})
export class FamilyGroupsModule {}
