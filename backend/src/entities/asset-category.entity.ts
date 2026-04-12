import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { FamilyGroup } from './family-group.entity'

@Entity('asset_categories')
@Unique(['familyGroupId', 'name'])
export class AssetCategory {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  familyGroupId: number

  @ManyToOne(() => FamilyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup

  @Column()
  name: string
}
