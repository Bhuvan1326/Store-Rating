import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Store) private storesRepo: Repository<Store>,
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
  ) {}

  async getDashboard(ownerId: string) {
    const store = await this.storesRepo.findOne({ where: { ownerId } });
    if (!store) {
      throw new NotFoundException('No store found for your account. Contact an admin.');
    }

    const ratings = await this.ratingsRepo
      .createQueryBuilder('rating')
      .innerJoin('rating.user', 'user')
      .select([
        'rating.id',
        'rating.rating',
        'rating.createdAt',
        'user.id',
        'user.name',
        'user.email',
      ])
      .where('rating.storeId = :storeId', { storeId: store.id })
      .orderBy('rating.createdAt', 'DESC')
      .getMany();

    const avgRating =
      ratings.length > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1),
          )
        : null;

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: avgRating,
      totalRatings: ratings.length,
      raters: ratings.map((r) => ({
        ratingId: r.id,
        rating: r.rating,
        submittedAt: r.createdAt,
        user: {
          id: (r as any).user?.id,
          name: (r as any).user?.name,
          email: (r as any).user?.email,
        },
      })),
    };
  }
}
