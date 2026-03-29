import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { FamilyGroup } from '../entities/family-group.entity';
import { CreateFamilyGroupDto } from './dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from './dto/update-family-group.dto';
import { FamilyGroupsService } from './family-groups.service';

@Controller('family-groups')
export class FamilyGroupsController {
  constructor(private readonly familyGroupsService: FamilyGroupsService) {}

  @Post()
  create(@Body() createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup> {
    return this.familyGroupsService.create(createFamilyGroupDto);
  }

  @Get()
  findAll(): Promise<FamilyGroup[]> {
    return this.familyGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FamilyGroup> {
    return this.familyGroupsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyGroupDto: UpdateFamilyGroupDto,
  ): Promise<FamilyGroup> {
    return this.familyGroupsService.update(id, updateFamilyGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.familyGroupsService.remove(id);
  }
}
