import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CalendarEventsService } from './calendar-events.service'

describe('CalendarEventsService', () => {
  const calendarEventsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  }

  const familyGroupsRepository = {
    findOne: jest.fn(),
  }

  let service: CalendarEventsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CalendarEventsService(calendarEventsRepository as any, familyGroupsRepository as any)
  })

  it('throws if family group does not exist', async () => {
    familyGroupsRepository.findOne.mockResolvedValue(null)

    await expect(
      service.create({
        familyGroupId: 4,
        title: 'Event',
        startAt: '2026-01-01T10:00:00.000Z',
        endAt: '2026-01-01T11:00:00.000Z',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('creates calendar event with Date conversion', async () => {
    familyGroupsRepository.findOne.mockResolvedValue({ id: 4 })
    calendarEventsRepository.create.mockImplementation((value) => value)
    calendarEventsRepository.save.mockImplementation(async (value) => ({ id: 12, ...value }))

    const result = await service.create({
      familyGroupId: 4,
      title: 'Event',
      description: 'desc',
      startAt: '2026-01-01T10:00:00.000Z',
      endAt: '2026-01-01T11:00:00.000Z',
    } as any)

    expect(result.id).toBe(12)
    expect(calendarEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        startAt: expect.any(Date),
        endAt: expect.any(Date),
      }),
    )
  })

  it('findAll filters and orders', async () => {
    calendarEventsRepository.find.mockResolvedValue([{ id: 1 }])

    await expect(service.findAll('9')).resolves.toEqual([{ id: 1 }])
    expect(calendarEventsRepository.find).toHaveBeenCalledWith({
      where: { familyGroupId: 9 },
      order: { startAt: 'ASC' },
    })
  })

  it('remove throws if no row affected', async () => {
    calendarEventsRepository.delete.mockResolvedValue({ affected: 0 })
    await expect(service.remove('3')).rejects.toBeInstanceOf(NotFoundException)
  })
})
