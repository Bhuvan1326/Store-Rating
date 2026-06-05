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

  @Index()
  @Column({ length: 60 })
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

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

  @OneToMany(() => Rating, (rating) => rating.user, { cascade: ['remove'] })
  ratings: Rating[];

  @OneToOne(() => Store, (store) => store.owner)
  store: Store;
}
