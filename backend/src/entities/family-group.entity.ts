import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('family_groups')
export class FamilyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'simple-json' })
  members: string[];

  @Column()
  ownerId: string;
}
