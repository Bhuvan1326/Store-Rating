import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rating } from '../ratings/rating.entity';
import { Store } from '../stores/store.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  STORE_OWNER = 'store_owner',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Indexed for filter-by-name queries
  @Index()
  @Column({ length: 60 })
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  // Never returned in API responses — excluded via class-transformer
  @Exclude()
  @Column()
  password: string;

  @Column({ length: 400, nullable: true })
  address: string;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // A user submits many ratings
  @OneToMany(() => Rating, (rating) => rating.user, { cascade: ['remove'] })
  ratings: Rating[];

  // A store_owner owns one store
  @OneToOne(() => Store, (store) => store.owner)
  store: Store;
}
