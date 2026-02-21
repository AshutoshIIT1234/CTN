import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Notification Settings
  @Column({ default: true })
  notifyLikes: boolean;

  @Column({ default: true })
  notifyComments: boolean;

  @Column({ default: true })
  notifyReplies: boolean;

  @Column({ default: true })
  notifyFollows: boolean;

  @Column({ default: true })
  notifyMessages: boolean;

  @Column({ default: false })
  emailNotifications: boolean;

  // Privacy Settings
  @Column({ default: false })
  privateAccount: boolean;

  @Column({ default: true })
  showActivityStatus: boolean;

  @Column({ default: true })
  allowTagging: boolean;

  @Column({ default: true })
  allowMentions: boolean;

  // Appearance Settings
  @Column({ default: 'light' })
  theme: string;
}
