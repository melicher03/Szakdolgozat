import { NotFoundException } from '@nestjs/common'
import { AssetsService } from './assets.service'

describe('AssetsService', () => {
  const assetsRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

  let service: AssetsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AssetsService(
      assetsRepository as any,
      familyGroupsRepository as any,
      messagesGateway as any,
    )
  })

  it('findAll filters by group when provided', async () => {
    assetsRepository.find.mockResolvedValue([{ id: 1 }])
    await expect(service.findAll('5')).resolves.toEqual([{ id: 1 }])

    expect(assetsRepository.find).toHaveBeenCalledWith({
      where: { familyGroupId: 5, storagePath: expect.anything() },
    })
  })

  it('findAll returns all file assets when no group id', async () => {
    assetsRepository.find.mockResolvedValue([{ id: 1 }])
    await service.findAll()

    expect(assetsRepository.find).toHaveBeenCalledWith({
      where: { storagePath: expect.anything() },
    })
  })

  it('throws when family group does not exist', async () => {
    familyGroupsRepository.findOne.mockResolvedValue(null)

    await expect(
      service.createFileAsset({
        familyGroupId: 2,
        storagePath: 'x',
        categoryName: 'docs',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('creates and emits file asset', async () => {
    familyGroupsRepository.findOne.mockResolvedValue({ id: 2 })
    assetsRepository.create.mockImplementation((value) => value)
    assetsRepository.save.mockImplementation(async (value) => ({ id: 9, ...value }))

    const result = await service.createFileAsset({
      familyGroupId: 2,
      storagePath: 'folder/file.png',
      categoryName: '  media ',
    } as any)

    expect(result.id).toBe(9)
    expect(assetsRepository.create).toHaveBeenCalledWith({
      familyGroupId: 2,
      storagePath: 'folder/file.png',
      categoryName: 'media',
    })
    expect(messagesGateway.server.to).toHaveBeenCalledWith('2')
    expect(emit).toHaveBeenCalledWith('asset-created', expect.objectContaining({ id: 9 }))
  })
})
