import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { CalendarEvent } from '../entities/calendar-event.entity'
import { CalendarEventsService } from './calendar-events.service'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'

@Controller('calendar-events')
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  create(@Body() createCalendarEventDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    return this.calendarEventsService.create(createCalendarEventDto)
  }

  @Get()
  findAll(@Query('familyGroupId') familyGroupId?: string): Promise<CalendarEvent[]> {
    return this.calendarEventsService.findAll(familyGroupId)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.calendarEventsService.remove(id)
  }
}
