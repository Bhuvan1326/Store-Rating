import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users/user.entity';
import { Store } from './stores/store.entity';
import { Rating } from './ratings/rating.entity';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { OwnerModule } from './owner/owner.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Store, Rating],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
}),
    AuthModule,
    AdminModule,
    UsersModule,
    StoresModule,
    RatingsModule,
    OwnerModule,
  ],
})
export class AppModule {}
