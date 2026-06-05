import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/user.entity';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';
import { CreateUserDto, CreateStoreDto, UserFilterDto, StoreFilterDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Store) private storesRepo: Repository<Store>,
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
  ) {}

  async getDashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.usersRepo.count(),
      this.storesRepo.count(),
      this.ratingsRepo.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    await this.usersRepo.save(user);

    const { password, ...result } = user;
    return result;
  }

  async listUsers(filters: UserFilterDto) {
    const qb = this.usersRepo.createQueryBuilder('user');

    if (filters.name) {
      qb.andWhere('LOWER(user.name) LIKE :name', { name: `%${filters.name.toLowerCase()}%` });
    }
    if (filters.email) {
      qb.andWhere('LOWER(user.email) LIKE :email', { email: `%${filters.email.toLowerCase()}%` });
    }
    if (filters.address) {
      qb.andWhere('LOWER(user.address) LIKE :address', { address: `%${filters.address.toLowerCase()}%` });
    }
    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    const sortableColumns = ['name', 'email', 'role', 'createdAt'];
    const sortBy = sortableColumns.includes(filters.sortBy) ? filters.sortBy : 'createdAt';
    const sortOrder = filters.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`user.${sortBy}`, sortOrder);
    qb.select(['user.id', 'user.name', 'user.email', 'user.address', 'user.role', 'user.createdAt']);

    return qb.getMany();
  }

  async getUserById(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.STORE_OWNER) {
      const store = await this.storesRepo.findOne({ where: { ownerId: id } });
      if (store) {
        const result = await this.ratingsRepo
          .createQueryBuilder('rating')
          .select('AVG(rating.rating)', 'avg')
          .where('rating.storeId = :storeId', { storeId: store.id })
          .getRawOne();

        return {
          ...user,
          store: {
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            averageRating: result?.avg ? parseFloat(parseFloat(result.avg).toFixed(1)) : null,
          },
        };
      }
    }

    return user;
  }

  async listStores(filters: StoreFilterDto) {
    const qb = this.storesRepo
      .createQueryBuilder('store')
      .leftJoin('store.owner', 'owner')
      .leftJoin('store.ratings', 'rating')
      .select([
        'store.id',
        'store.name',
        'store.email',
        'store.address',
        'store.createdAt',
        'owner.id',
        'owner.name',
        'owner.email',
      ])
      .addSelect('AVG(rating.rating)', 'averageRating')
      .addSelect('COUNT(rating.id)', 'ratingCount')
      .groupBy('store.id, owner.id');

    if (filters.name) {
      qb.andWhere('LOWER(store.name) LIKE :name', { name: `%${filters.name.toLowerCase()}%` });
    }
    if (filters.address) {
      qb.andWhere('LOWER(store.address) LIKE :address', { address: `%${filters.address.toLowerCase()}%` });
    }

    const sortableColumns = { name: 'store.name', address: 'store.address', createdAt: 'store.createdAt' };
    const sortCol = sortableColumns[filters.sortBy] || 'store.name';
    const sortOrder = filters.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(sortCol, sortOrder);

    const raw = await qb.getRawAndEntities();

    return raw.entities.map((store, i) => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      createdAt: store.createdAt,
      owner: store.owner,
      averageRating: raw.raw[i]?.averageRating
        ? parseFloat(parseFloat(raw.raw[i].averageRating).toFixed(1))
        : null,
      ratingCount: parseInt(raw.raw[i]?.ratingCount || '0'),
    }));
  }

  async createStore(dto: CreateStoreDto) {
    const owner = await this.usersRepo.findOne({ where: { id: dto.ownerId } });
    if (!owner) throw new NotFoundException('Owner user not found');
    if (owner.role !== UserRole.STORE_OWNER) {
      throw new BadRequestException('Owner must have the store_owner role');
    }

    const existing = await this.storesRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A store with this email already exists');

    const store = this.storesRepo.create(dto);
    return this.storesRepo.save(store);
  }

  async listStoreOwners() {
    return this.usersRepo.find({
      where: { role: UserRole.STORE_OWNER },
      select: ['id', 'name', 'email'],
    });
  }
}
