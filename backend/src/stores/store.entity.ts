import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Rating } from '../ratings/rating.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 60 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 400 })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // FK → users.id; cascade delete removes store when owner is deleted
  @ManyToOne(() => User, (user) => user.store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  // A store collects many ratings
  @OneToMany(() => Rating, (rating) => rating.store, { cascade: ['remove'] })
  ratings: Rating[];
}
