import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { FamilyGroupsService } from './family-groups.service'

describe('FamilyGroupsService', () => {
  let service: FamilyGroupsService

  const repository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new FamilyGroupsService(repository as any)
  })

  it('creates a family group with normalized fields', async () => {
    const dto = {
      name: '  My Group  ',
      ownerId: ' OWNER@MAIL.COM ',
      members: [' User1@Mail.com ', 'owner@mail.com'],
    }

    repository.findOne.mockResolvedValue(null)
    repository.create.mockImplementation((value) => value)
    repository.save.mockImplementation(async (value) => ({ id: 1, ...value }))

    const result = await service.create(dto as any)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my group',
        ownerId: 'owner@mail.com',
        members: ['user1@mail.com', 'owner@mail.com'],
      }),
    )
    expect(result.id).toBe(1)
  })

  it('throws on duplicate group name during create', async () => {
    repository.findOne.mockResolvedValue({ id: 8, name: 'my group' })

    await expect(
      service.create({ name: 'my group', ownerId: 'x', members: [] } as any),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('throws when ownerId is empty after trim', async () => {
    await expect(
      service.create({ name: 'x', ownerId: '   ', members: ['a'] } as any),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('returns all groups', async () => {
    repository.find.mockResolvedValue([{ id: 1 }])
    await expect(service.findAll()).resolves.toEqual([{ id: 1 }])
  })

  it('updates and normalizes name and members', async () => {
    const existing = {
      id: 3,
      name: 'old',
      ownerId: 'owner@mail.com',
      members: ['owner@mail.com'],
    }

    repository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null)
    repository.save.mockImplementation(async (value) => value)

    const result = await service.update('3', {
      name: '  New Name ',
      members: [' NEW@MAIL.COM '],
    } as any)

    expect(result.name).toBe('new name')
    expect(result.members).toEqual(['new@mail.com', 'owner@mail.com'])
  })

  it('throws on duplicate group name during update', async () => {
    const existing = {
      id: 1,
      name: 'old',
      ownerId: 'owner@mail.com',
      members: ['owner@mail.com'],
    }

    repository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ id: 2, name: 'new name' })

    await expect(service.update('1', { name: 'new name' } as any)).rejects.toBeInstanceOf(
      ConflictException,
    )
  })

  it('findOne throws when not found', async () => {
    repository.findOne.mockResolvedValue(null)
    await expect(service.findOne('99')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('remove throws when nothing deleted', async () => {
    repository.delete.mockResolvedValue({ affected: 0 })
    await expect(service.remove('12')).rejects.toBeInstanceOf(NotFoundException)
  })
})
