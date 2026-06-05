import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

@Injectable()
export class StoresService {
  constructor(@InjectRepository(Store) private storesRepo: Repository<Store>) {}

  async listStores(userId: string, search?: string) {
    const qb = this.storesRepo
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .leftJoin(
        'store.ratings',
        'myRating',
        'myRating.userId = :userId',
        { userId },
      )
      .select([
        'store.id',
        'store.name',
        'store.address',
        'store.email',
      ])
      .addSelect('ROUND(AVG(rating.rating), 1)', 'averageRating')
      .addSelect('myRating.rating', 'myRating')
      .addSelect('myRating.id', 'myRatingId')
      .groupBy('store.id, myRating.rating, myRating.id');

    if (search) {
      qb.andWhere(
        '(LOWER(store.name) LIKE :search OR LOWER(store.address) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('store.name', 'ASC');

    const { entities, raw } = await qb.getRawAndEntities();

    return entities.map((store, i) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      email: store.email,
      averageRating: raw[i]?.averageRating ? parseFloat(raw[i].averageRating) : null,
      myRating: raw[i]?.myRating ?? null,
      myRatingId: raw[i]?.myRatingId ?? null,
    }));
  }
}
