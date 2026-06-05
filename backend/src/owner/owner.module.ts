import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Rating])],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
