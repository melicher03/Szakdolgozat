import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
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

  private members(members: string[], ownerId: string): string[] {
    const owner = ownerId.trim().toLowerCase()
    if (!owner) {
      throw new BadRequestException('ownerId is required')
    }

    const trimedMembers = members.map((member) => member.trim().toLowerCase())

    const setOfMembers = Array.from(new Set(trimedMembers))

    if (!setOfMembers.includes(owner)) {
      setOfMembers.push(owner)
    }

    return setOfMembers
  }

  async create(createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup> {
    const trimedName = createFamilyGroupDto.name.trim().toLowerCase()
    const trimedOwnerId = createFamilyGroupDto.ownerId.trim().toLowerCase()
    const trimedMembers = this.members(
      createFamilyGroupDto.members,
      trimedOwnerId,
    )

    const existing = await this.familyGroupsRepository.findOne({
      where: { name: trimedName },
    })

    if (existing) {
      throw new ConflictException('Family group name already exists')
    }

    const familyGroup = this.familyGroupsRepository.create({
      ...createFamilyGroupDto,
      name: trimedName,
      ownerId: trimedOwnerId,
      members: trimedMembers,
    })
    return this.familyGroupsRepository.save(familyGroup)
  }

  findAll(): Promise<FamilyGroup[]> {
    return this.familyGroupsRepository.find({ order: { name: 'ASC' } })
  }

  async update(id: string, updateFamilyGroupDto: UpdateFamilyGroupDto): Promise<FamilyGroup> {
    const familyGroup = await this.findOne(id)

    if (typeof updateFamilyGroupDto.name === 'string') {
      const trimedName = updateFamilyGroupDto.name.trim().toLowerCase()
      const existing = await this.familyGroupsRepository.findOne({
        where: { name: trimedName },
      })

      if (existing && existing.id !== familyGroup.id) {
        throw new ConflictException('Family group name already exists')
      }

      updateFamilyGroupDto.name = trimedName
    }

    if (Array.isArray(updateFamilyGroupDto.members)) {
      const newMembers = updateFamilyGroupDto.members

      updateFamilyGroupDto.members = this.members(newMembers, familyGroup.ownerId)
    }

    Object.assign(familyGroup, updateFamilyGroupDto)
    return this.familyGroupsRepository.save(familyGroup)
  }
  
  async findOne(id: string): Promise<FamilyGroup> {
    const familyGroup = await this.familyGroupsRepository.findOne({ where: { id: Number(id) } })
    if (!familyGroup) {
      throw new NotFoundException(`Family group with id ${id} was not found`)
    }
    return familyGroup
  }

  async remove(id: string): Promise<void> {
    const result = await this.familyGroupsRepository.delete(id)
    if (!result.affected) {
      throw new NotFoundException(`Family group with id ${id} was not found`)
    }
  }
}
