import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VerificationEntityTypeEnum } from '../constants/auth';
@Entity()
export default class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  email: string;

  @Column({ unique: true })
  token: string;

  @Column({ enum: VerificationEntityTypeEnum, nullable: false })
  type: string;

  @Column({ default: 0 })
  attemptsCount: number;

  @Column({ default: null })
  blockedAt: Date;

  @Column({ default: null })
  expiredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' }) // Using PostgreSQL's timestamp with time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' }) // Automatically updated whenever the entity is updated
  updatedAt: Date;
}
