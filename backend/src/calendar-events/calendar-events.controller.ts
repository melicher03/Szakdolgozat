import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CalendarEvent } from '../entities/calendar-event.entity';
import { CalendarEventsService } from './calendar-events.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@Controller('calendar-events')
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  create(@Body() createCalendarEventDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    return this.calendarEventsService.create(createCalendarEventDto);
  }

  @Get()
  findAll(@Query('familyGroupId') familyGroupId?: string): Promise<CalendarEvent[]> {
    return this.calendarEventsService.findAll(familyGroupId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CalendarEvent> {
    return this.calendarEventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCalendarEventDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarEventsService.update(id, updateCalendarEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.calendarEventsService.remove(id);
  }
}
