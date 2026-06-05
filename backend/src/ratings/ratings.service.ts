import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Store } from '../stores/store.entity';
import { IsInt, Min, Max, IsUUID } from 'class-validator';

export class CreateRatingDto {
  @IsUUID('4', { message: 'store_id must be a valid UUID' })
  store_id: string;

  @IsInt({ message: 'Rating must be a whole number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
}

export class UpdateRatingDto {
  @IsInt({ message: 'Rating must be a whole number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
}

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
    @InjectRepository(Store) private storesRepo: Repository<Store>,
  ) {}

  async createRating(userId: string, dto: CreateRatingDto) {
    const store = await this.storesRepo.findOne({ where: { id: dto.store_id } });
    if (!store) throw new NotFoundException('Store not found');

    // Enforce the one-rating-per-user-per-store rule at service level too
    const existing = await this.ratingsRepo.findOne({
      where: { userId, storeId: dto.store_id },
    });
    if (existing) {
      throw new ConflictException(
        'You already rated this store. Use the edit option to update your rating.',
      );
    }

    const ratingRecord = this.ratingsRepo.create({
      userId,
      storeId: dto.store_id,
      rating: dto.rating,
    });

    return this.ratingsRepo.save(ratingRecord);
  }

  async updateRating(userId: string, ratingId: string, dto: UpdateRatingDto) {
    const existing = await this.ratingsRepo.findOne({ where: { id: ratingId } });
    if (!existing) throw new NotFoundException('Rating not found');

    // Users can only edit their own ratings
    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only edit your own ratings');
    }

    existing.rating = dto.rating;
    return this.ratingsRepo.save(existing);
  }
}
