import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
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
}
