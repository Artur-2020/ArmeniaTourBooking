import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/index';

@Entity()
export default class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  enabledTwoFactor: boolean;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamptz' }) // Using PostgreSQL's timestamp with time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' }) // Automatically updated whenever the entity is updated
  updatedAt: Date;
}
