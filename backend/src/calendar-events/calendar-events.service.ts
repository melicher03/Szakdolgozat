import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FamilyGroup } from '../entities/family-group.entity'
import { CalendarEvent } from '../entities/calendar-event.entity'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'

@Injectable()
export class CalendarEventsService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarEventsRepository: Repository<CalendarEvent>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
  ) {}

  async create(createCalendarEventDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    const familyGroup = await this.familyGroupsRepository.findOne({
      where: { id: createCalendarEventDto.familyGroupId },
    })

    if (!familyGroup) {
      throw new BadRequestException(
        `Family group with id ${createCalendarEventDto.familyGroupId} does not exist`,
      )
    }

    const startAt = new Date(createCalendarEventDto.startAt)
    const endAt = new Date(createCalendarEventDto.endAt)

    const calendarEvent = this.calendarEventsRepository.create({
      ...createCalendarEventDto,
      startAt,
      endAt,
    })

    return this.calendarEventsRepository.save(calendarEvent)
  }

  async findAll(familyGroupId?: string): Promise<CalendarEvent[]> {
    const normalizedFamilyGroupId =
      familyGroupId && familyGroupId.trim().length > 0 ? Number(familyGroupId) : undefined

    return this.calendarEventsRepository.find({
      where: normalizedFamilyGroupId ? { familyGroupId: normalizedFamilyGroupId } : {},
      order: { startAt: 'ASC' },
    })
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const calendarEvent = await this.calendarEventsRepository.findOne({ where: { id: Number(id) } })
    if (!calendarEvent) {
      throw new NotFoundException(`Calendar event with id ${id} was not found`)
    }
    return calendarEvent
  }

  async update(id: string, updateCalendarEventDto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const calendarEvent = await this.findOne(id)

    if (updateCalendarEventDto.familyGroupId !== undefined) {
      const familyGroup = await this.familyGroupsRepository.findOne({
        where: { id: updateCalendarEventDto.familyGroupId },
      })

      if (!familyGroup) {
        throw new BadRequestException(
          `Family group with id ${updateCalendarEventDto.familyGroupId} does not exist`,
        )
      }
    }

    const nextStartAt = updateCalendarEventDto.startAt
      ? new Date(updateCalendarEventDto.startAt)
      : calendarEvent.startAt
    const nextEndAt = updateCalendarEventDto.endAt
      ? new Date(updateCalendarEventDto.endAt)
      : calendarEvent.endAt

    Object.assign(calendarEvent, {
      ...updateCalendarEventDto,
      startAt: nextStartAt,
      endAt: nextEndAt,
    })

    return this.calendarEventsRepository.save(calendarEvent)
  }

  async remove(id: string): Promise<void> {
    const result = await this.calendarEventsRepository.delete(id)
    if (!result.affected) {
      throw new NotFoundException(`Calendar event with id ${id} was not found`)
    }
  }
}
