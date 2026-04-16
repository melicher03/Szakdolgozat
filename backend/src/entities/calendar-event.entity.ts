import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FamilyGroup } from './family-group.entity'

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description?: string

  @Column({ type: 'timestamp' })
  startAt: Date

  @Column({ type: 'timestamp' })
  endAt: Date

  @Column()
  familyGroupId: number

  @ManyToOne(() => FamilyGroup)
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup
}
