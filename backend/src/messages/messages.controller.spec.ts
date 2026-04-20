import { MessagesController } from './messages.controller'

describe('MessagesController', () => {
  const service = {
    findByFamilyGroup: jest.fn(),
  }

  let controller: MessagesController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new MessagesController(service as any)
  })

  it('passes numeric group id to service', async () => {
    service.findByFamilyGroup.mockResolvedValue([{ id: 1 }])

    await expect(controller.findByFamilyGroup('12')).resolves.toEqual([{ id: 1 }])
    expect(service.findByFamilyGroup).toHaveBeenCalledWith(12)
  })
})
