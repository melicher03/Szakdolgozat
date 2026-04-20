import { CalendarEventsController } from './calendar-events.controller'

describe('CalendarEventsController', () => {
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  }

  let controller: CalendarEventsController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new CalendarEventsController(service as any)
  })

  it('delegates create', async () => {
    const dto = {
      familyGroupId: 1,
      title: 'Event',
      startAt: '2026-01-01T10:00:00.000Z',
      endAt: '2026-01-01T11:00:00.000Z',
    }
    service.create.mockResolvedValue({ id: 1, ...dto })

    await expect(controller.create(dto as any)).resolves.toEqual({ id: 1, ...dto })
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }])
    await expect(controller.findAll('2')).resolves.toEqual([{ id: 1 }])
    expect(service.findAll).toHaveBeenCalledWith('2')
  })

  it('delegates remove', async () => {
    service.remove.mockResolvedValue(undefined)
    await expect(controller.remove('1')).resolves.toBeUndefined()
    expect(service.remove).toHaveBeenCalledWith('1')
  })
})
