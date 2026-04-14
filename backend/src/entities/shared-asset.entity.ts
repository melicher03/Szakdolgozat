import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FamilyGroup } from './family-group.entity'

export enum SharedAssetType {
  FILE = 'FILE',
  URL = 'URL',
}

@Entity('shared_assets')
export class SharedAsset {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ type: 'enum', enum: SharedAssetType })
  type: SharedAssetType

  @Column({ nullable: true })
  title?: string

  @Column()
  url: string

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

  @Column()
  uploadedBy: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
