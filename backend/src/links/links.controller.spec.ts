import { LinksController } from './links.controller'

describe('LinksController', () => {
  const service = {
    findAll: jest.fn(),
    createLink: jest.fn(),
  }

  let controller: LinksController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new LinksController(service as any)
  })

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }])
    await expect(controller.findAll('5')).resolves.toEqual([{ id: 1 }])
    expect(service.findAll).toHaveBeenCalledWith('5')
  })

  it('delegates createLink', async () => {
    const dto = { familyGroupId: 5, url: 'https://example.com', categoryName: 'docs' }
    service.createLink.mockResolvedValue({ id: 2, ...dto })

    await expect(controller.createLink(dto as any)).resolves.toEqual({ id: 2, ...dto })
    expect(service.createLink).toHaveBeenCalledWith(dto)
  })
})
