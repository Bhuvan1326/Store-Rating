/**
 * Seed Script — creates admin, store owner, normal user, and a sample store.
 * Run from the backend folder:
 *   npx ts-node src/seed.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './users/user.entity';
import { Store } from './stores/store.entity';
import { Rating } from './ratings/rating.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'store_ratings',
  entities: [User, Store, Rating],
  synchronize: true,
});

async function seed() {
  console.log('Connecting to database…');
  await AppDataSource.initialize();
  console.log('Connected.\n');

  const userRepo  = AppDataSource.getRepository(User);
  const storeRepo = AppDataSource.getRepository(Store);

  // ── Admin ──────────────────────────────────────────────────
  const adminExists = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (adminExists) {
    console.log('Admin already exists — updating password to Admin@1234');
    adminExists.password = await bcrypt.hash('Admin@1234', 12);
    await userRepo.save(adminExists);
  } else {
    const admin = userRepo.create({
      name: 'System Administrator Account',
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin@1234', 12),
      address: 'Admin Office, Main Street',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('✓ Admin created — admin@example.com / Admin@1234');
  }

  // ── Store Owner ────────────────────────────────────────────
  let owner = await userRepo.findOne({ where: { email: 'owner@example.com' } });
  if (owner) {
    console.log('Store owner already exists — updating password to Owner@1234');
    owner.password = await bcrypt.hash('Owner@1234', 12);
    await userRepo.save(owner);
  } else {
    owner = userRepo.create({
      name: 'Sample Store Owner User Account',
      email: 'owner@example.com',
      password: await bcrypt.hash('Owner@1234', 12),
      address: '456 Business Avenue, Commerce City',
      role: UserRole.STORE_OWNER,
    });
    await userRepo.save(owner);
    console.log('✓ Store owner created — owner@example.com / Owner@1234');
  }

  // ── Normal User ────────────────────────────────────────────
  const userExists = await userRepo.findOne({ where: { email: 'user@example.com' } });
  if (userExists) {
    console.log('Normal user already exists — updating password to User@1234');
    userExists.password = await bcrypt.hash('User@1234', 12);
    await userRepo.save(userExists);
  } else {
    const normalUser = userRepo.create({
      name: 'Sample Normal User Account Here',
      email: 'user@example.com',
      password: await bcrypt.hash('User@1234', 12),
      address: '789 Residential Lane, Suburb Town',
      role: UserRole.USER,
    });
    await userRepo.save(normalUser);
    console.log('✓ Normal user created — user@example.com / User@1234');
  }

  // ── Sample Store ───────────────────────────────────────────
  const storeExists = await storeRepo.findOne({ where: { email: 'contact@grandsamplestore.com' } });
  if (!storeExists) {
    const store = storeRepo.create({
      name: 'The Grand Sample Store',
      email: 'contact@grandsamplestore.com',
      address: '123 Main Street, Downtown District',
      ownerId: owner.id,
    });
    await storeRepo.save(store);
    console.log('✓ Sample store created — The Grand Sample Store');
  } else {
    console.log('Sample store already exists — skipping');
  }

  console.log('\nSeed complete.\n');
  console.log('Login credentials:');
  console.log('  admin@example.com   →  Admin@1234  (Admin)');
  console.log('  owner@example.com   →  Owner@1234  (Store Owner)');
  console.log('  user@example.com    →  User@1234   (Normal User)');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
