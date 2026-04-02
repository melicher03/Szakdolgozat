import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  text: string

  @Column()
  senderId: string

  @Column()
  senderName: string

  @Column()
  familyGroupId: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
