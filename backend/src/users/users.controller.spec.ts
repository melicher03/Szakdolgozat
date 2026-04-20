import { UsersController } from './users.controller'

describe('UsersController', () => {
  const service = {
    findAll: jest.fn(),
  }

  let controller: UsersController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new UsersController(service as any)
  })

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue([{ email: 'a@b.com' }])
    await expect(controller.findAll()).resolves.toEqual([{ email: 'a@b.com' }])
    expect(service.findAll).toHaveBeenCalledTimes(1)
  })
})
