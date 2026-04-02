import { Column, Entity, Unique, PrimaryGeneratedColumn } from 'typeorm'

@Entity('family_groups')
@Unique(['name'])
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
