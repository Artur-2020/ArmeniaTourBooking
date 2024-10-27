import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class VerificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  token: string;

  @Column({ nullable: true })
  expiredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' }) // Using PostgreSQL's timestamp with time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' }) // Automatically updated whenever the entity is updated
  updatedAt: Date;
}
