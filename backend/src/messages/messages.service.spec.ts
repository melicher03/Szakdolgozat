import { MessagesService } from './messages.service'

describe('MessagesService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  }

  let service: MessagesService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new MessagesService(repository as any)
  })

  it('creates and saves a message', async () => {
    const dto = { text: 'hello', senderId: 'u1', senderName: 'U', familyGroupId: 2 }
    repository.create.mockReturnValue(dto)
    repository.save.mockResolvedValue({ id: 5, ...dto })

    await expect(service.create(dto as any)).resolves.toEqual({ id: 5, ...dto })
    expect(repository.create).toHaveBeenCalledWith(dto)
  })

  it('finds messages by group ordered by date', async () => {
    repository.find.mockResolvedValue([{ id: 1 }])

    await expect(service.findByFamilyGroup(7)).resolves.toEqual([{ id: 1 }])
    expect(repository.find).toHaveBeenCalledWith({
      where: { familyGroupId: 7 },
      order: { createdAt: 'ASC' },
    })
  })

  it('finds message by id', async () => {
    repository.findOne.mockResolvedValue({ id: 9 })
    await expect(service.findById('9')).resolves.toEqual({ id: 9 })
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 9 } })
  })

  it('deletes by id', async () => {
    repository.delete.mockResolvedValue({ affected: 1 })
    await expect(service.delete('3')).resolves.toBeUndefined()
    expect(repository.delete).toHaveBeenCalledWith('3')
  })
})
