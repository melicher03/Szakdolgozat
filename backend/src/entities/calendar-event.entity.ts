import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FamilyGroup } from './family-group.entity';

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description?: string;

  @Column({ type: "timestamp" })
  startAt: Date;

  @Column({ type: "timestamp" })
  endAt: Date;

  @Column()
  familyGroupId: string;

  @ManyToOne(() => FamilyGroup)
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup;
}
