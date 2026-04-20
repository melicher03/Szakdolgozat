import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriesService } from './categories.service'

describe('CategoriesService', () => {
  const categoriesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  }

  const assetsRepository = {
    update: jest.fn(),
  }

  const linksRepository = {
    update: jest.fn(),
  }

  const familyGroupsRepository = {
    findOne: jest.fn(),
  }

  const emit = jest.fn()
  const messagesGateway = {
    server: {
      to: jest.fn().mockReturnValue({ emit }),
    },
  }

  let service: CategoriesService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CategoriesService(
      categoriesRepository as any,
      assetsRepository as any,
      linksRepository as any,
      familyGroupsRepository as any,
      messagesGateway as any,
    )
  })

  it('findAll filters by familyGroupId', async () => {
    categoriesRepository.find.mockResolvedValue([{ id: 1 }])
    await expect(service.findAll('3')).resolves.toEqual([{ id: 1 }])
    expect(categoriesRepository.find).toHaveBeenCalledWith({ where: { familyGroupId: 3 } })
  })

  it('throws when family group does not exist', async () => {
    familyGroupsRepository.findOne.mockResolvedValue(null)
    await expect(service.create({ familyGroupId: 2, name: 'docs' } as any)).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it('throws for empty category name', async () => {
    familyGroupsRepository.findOne.mockResolvedValue({ id: 2 })
    await expect(service.create({ familyGroupId: 2, name: '   ' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it('returns existing category without creating duplicate', async () => {
    familyGroupsRepository.findOne.mockResolvedValue({ id: 2 })
    categoriesRepository.findOne.mockResolvedValue({ id: 5, familyGroupId: 2, name: 'docs' })

    await expect(service.create({ familyGroupId: 2, name: 'docs' } as any)).resolves.toEqual({
      id: 5,
      familyGroupId: 2,
      name: 'docs',
    })
    expect(categoriesRepository.save).not.toHaveBeenCalled()
  })

  it('creates and emits category-created', async () => {
    familyGroupsRepository.findOne.mockResolvedValue({ id: 2 })
    categoriesRepository.findOne.mockResolvedValue(null)
    categoriesRepository.create.mockImplementation((value) => value)
    categoriesRepository.save.mockImplementation(async (value) => ({ id: 7, ...value }))

    const result = await service.create({ familyGroupId: 2, name: '  docs  ' } as any)

    expect(result).toEqual({ id: 7, familyGroupId: 2, name: 'docs' })
    expect(messagesGateway.server.to).toHaveBeenCalledWith('2')
    expect(emit).toHaveBeenCalledWith('category-created', expect.objectContaining({ id: 7 }))
  })

  it('remove throws when category not found', async () => {
    categoriesRepository.findOne.mockResolvedValue(null)
    await expect(service.remove('11')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('remove clears category references then emits asset-category-updated', async () => {
    const category = { id: 4, familyGroupId: 9, name: 'docs' }
    categoriesRepository.findOne.mockResolvedValue(category)
    assetsRepository.update.mockResolvedValue({ affected: 1 })
    linksRepository.update.mockResolvedValue({ affected: 1 })
    categoriesRepository.remove.mockResolvedValue(category)

    await expect(service.remove('4')).resolves.toBeUndefined()

    expect(assetsRepository.update).toHaveBeenCalledWith(
      { familyGroupId: 9, categoryName: 'docs' },
      { categoryName: '' },
    )
    expect(linksRepository.update).toHaveBeenCalledWith(
      { familyGroupId: 9, categoryName: 'docs' },
      { categoryName: '' },
    )
    expect(messagesGateway.server.to).toHaveBeenCalledWith('9')
    expect(emit).toHaveBeenCalledWith('asset-category-updated')
  })
})
