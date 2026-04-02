import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FamilyGroup } from '../entities/family-group.entity'
import { CreateFamilyGroupDto } from './dto/create-family-group.dto'
import { UpdateFamilyGroupDto } from './dto/update-family-group.dto'

@Injectable()
export class FamilyGroupsService {
  constructor(
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
  ) {}

  create(createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup> {
    const familyGroup = this.familyGroupsRepository.create(createFamilyGroupDto)
    return this.familyGroupsRepository.save(familyGroup)
  }

  findAll(): Promise<FamilyGroup[]> {
    return this.familyGroupsRepository.find({ order: { name: 'ASC' } })
  }

  async findOne(id: string): Promise<FamilyGroup> {
    const familyGroup = await this.familyGroupsRepository.findOne({ where: { id: Number(id) } })
    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${id} was not found`)
    }
    return familyGroup
  }

  async update(id: string, updateFamilyGroupDto: UpdateFamilyGroupDto): Promise<FamilyGroup> {
    const familyGroup = await this.findOne(id)
    Object.assign(familyGroup, updateFamilyGroupDto)
    return this.familyGroupsRepository.save(familyGroup)
  }

  async remove(id: string): Promise<void> {
    const result = await this.familyGroupsRepository.delete(id)
    if (!result.affected) {
      throw new NotFoundException(`Family group with id ${id} was not found`)
    }
  }
}
