import { AssetsController } from './assets.controller'

describe('AssetsController', () => {
  const service = {
    findAll: jest.fn(),
    createFileAsset: jest.fn(),
  }

  let controller: AssetsController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new AssetsController(service as any)
  })

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }])
    await expect(controller.findAll('4')).resolves.toEqual([{ id: 1 }])
    expect(service.findAll).toHaveBeenCalledWith('4')
  })

  it('delegates createFileAsset', async () => {
    const dto = { familyGroupId: 4, storagePath: 'p', categoryName: 'x' }
    service.createFileAsset.mockResolvedValue({ id: 2, ...dto })

    await expect(controller.createFileAsset(dto as any)).resolves.toEqual({ id: 2, ...dto })
    expect(service.createFileAsset).toHaveBeenCalledWith(dto)
  })
})
