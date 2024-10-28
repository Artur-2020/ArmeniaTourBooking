import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: true })
  token: string;

  @CreateDateColumn({ type: 'timestamptz' }) // Using PostgreSQL's timestamp with time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' }) // Automatically updated whenever the entity is updated
  updatedAt: Date;
}
