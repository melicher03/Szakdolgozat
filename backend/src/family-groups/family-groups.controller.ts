import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { FamilyGroup } from '../entities/family-group.entity'
import { CreateFamilyGroupDto } from './dto/create-family-group.dto'
import { UpdateFamilyGroupDto } from './dto/update-family-group.dto'
import { FamilyGroupsService } from './family-groups.service'

@Controller('family-groups')
export class FamilyGroupsController {
  constructor(private readonly familyGroupsService: FamilyGroupsService) {}

  @Post()
  async create(@Body() createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup> {
    return await this.familyGroupsService.create(createFamilyGroupDto)
  }

  @Get()
  findAll(): Promise<FamilyGroup[]> {
    return this.familyGroupsService.findAll()
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFamilyGroupDto: UpdateFamilyGroupDto,
  ): Promise<FamilyGroup> {
    return this.familyGroupsService.update(id, updateFamilyGroupDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.familyGroupsService.remove(id)
  }
}
