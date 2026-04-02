import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CalendarEvent } from '../entities/calendar-event.entity'
import { FamilyGroup } from '../entities/family-group.entity'
import { CalendarEventsController } from './calendar-events.controller'
import { CalendarEventsService } from './calendar-events.service'

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent, FamilyGroup])],
  controllers: [CalendarEventsController],
  providers: [CalendarEventsService],
})
export class CalendarEventsModule {}
