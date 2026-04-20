import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FamilyGroup } from './family-group.entity'

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  text: string

  @Column()
  senderId: string

  @Column()
  senderName: string

  @Column()
  familyGroupId: number

  @ManyToOne(() => FamilyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
