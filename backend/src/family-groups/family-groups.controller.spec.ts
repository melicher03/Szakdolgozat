import { FamilyGroupsController } from './family-groups.controller'

describe('FamilyGroupsController', () => {
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  let controller: FamilyGroupsController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new FamilyGroupsController(service as any)
  })

  it('delegates create', async () => {
    const dto = { name: 'g', ownerId: 'o', members: [] }
    service.create.mockResolvedValue({ id: 1, ...dto })
    await expect(controller.create(dto as any)).resolves.toEqual({ id: 1, ...dto })
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }])
    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }])
  })

  it('delegates update', async () => {
    service.update.mockResolvedValue({ id: 1, name: 'new' })
    await expect(controller.update('1', { name: 'new' } as any)).resolves.toEqual({
      id: 1,
      name: 'new',
    })
    expect(service.update).toHaveBeenCalledWith('1', { name: 'new' })
  })

  it('delegates remove', async () => {
    service.remove.mockResolvedValue(undefined)
    await expect(controller.remove('1')).resolves.toBeUndefined()
    expect(service.remove).toHaveBeenCalledWith('1')
  })
})
