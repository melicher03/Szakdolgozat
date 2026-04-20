import { NotFoundException } from '@nestjs/common'
import { LinksService } from './links.service'

describe('LinksService', () => {
  const linksRepository = {
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

  let service: LinksService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new LinksService(
      linksRepository as any,
      familyGroupsRepository as any,
      messagesGateway as any,
    )
  })

  it('findAll filters by group id', async () => {
    linksRepository.find.mockResolvedValue([{ id: 1 }])
    await expect(service.findAll('6')).resolves.toEqual([{ id: 1 }])
    expect(linksRepository.find).toHaveBeenCalledWith({ where: { familyGroupId: 6 } })
  })

  it('throws when family group is missing', async () => {
    familyGroupsRepository.findOne.mockResolvedValue(null)

    await expect(
      service.createLink({
        familyGroupId: 2,
        url: 'https://example.com',
        title: 'x',
        categoryName: 'docs',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('creates link and emits event', async () => {
    familyGroupsRepository.findOne.mockResolvedValue({ id: 3 })
    linksRepository.create.mockImplementation((value) => value)
    linksRepository.save.mockImplementation(async (value) => ({ id: 8, ...value }))

    const result = await service.createLink({
      familyGroupId: 3,
      url: 'https://example.com',
      title: undefined,
      categoryName: '  docs  ',
    } as any)

    expect(result.id).toBe(8)
    expect(linksRepository.create).toHaveBeenCalledWith({
      familyGroupId: 3,
      url: 'https://example.com',
      title: undefined,
      categoryName: 'docs',
    })
    expect(messagesGateway.server.to).toHaveBeenCalledWith('3')
    expect(emit).toHaveBeenCalledWith('link-created', expect.objectContaining({ id: 8 }))
  })
})
