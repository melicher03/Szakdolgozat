import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('family_groups')
export class FamilyGroup {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ type: 'simple-json' })
  members: string[]

  @Column()
  ownerId: string
}
