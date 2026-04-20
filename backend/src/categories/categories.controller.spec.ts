import { CategoriesController } from './categories.controller'

describe('CategoriesController', () => {
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  }

  let controller: CategoriesController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new CategoriesController(service as any)
  })

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }])
    await expect(controller.findAll('5')).resolves.toEqual([{ id: 1 }])
    expect(service.findAll).toHaveBeenCalledWith('5')
  })

  it('delegates create', async () => {
    const dto = { familyGroupId: 5, name: 'docs' }
    service.create.mockResolvedValue({ id: 2, ...dto })
    await expect(controller.create(dto as any)).resolves.toEqual({ id: 2, ...dto })
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('delegates remove', async () => {
    service.remove.mockResolvedValue(undefined)
    await expect(controller.remove('7')).resolves.toBeUndefined()
    expect(service.remove).toHaveBeenCalledWith('7')
  })
})
