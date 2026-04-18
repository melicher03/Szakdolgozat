import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FamilyGroup } from './family-group.entity'

@Entity('shared_assets')
export class SharedAsset {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ nullable: true })
  storagePath?: string

  @Column({ nullable: true })
  fileSize?: number

  @Column({ type: 'varchar', nullable: true })
  categoryName?: string | null

  @Column()
  familyGroupId: number

  @ManyToOne(() => FamilyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
