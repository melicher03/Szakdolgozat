import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FamilyGroup } from './family-group.entity'

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ nullable: true })
  title?: string

  @Column()
  url: string

  @Column()
  categoryName: string

  @Column()
  familyGroupId: number

  @ManyToOne(() => FamilyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup
}