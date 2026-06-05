-- ============================================================
-- Store Ratings Platform — Full Database Setup
-- Run this file once in pgAdmin or psql:
--   psql -U postgres -d store_ratings -f setup.sql
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- enables gen_random_uuid()


-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user', 'store_owner');
EXCEPTION
  WHEN duplicate_object THEN NULL; -- skip if already exists
END $$;


-- ────────────────────────────────────────────────────────────
-- TABLE: users
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(60)   NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  address     VARCHAR(400),
  role        user_role     NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique UNIQUE (email)
);

-- Indexes for filter + sort performance
CREATE INDEX IF NOT EXISTS idx_users_name       ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_email      ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users (role);


-- ────────────────────────────────────────────────────────────
-- TABLE: stores
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stores (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(60)   NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  address     VARCHAR(400)  NOT NULL,
  owner_id    UUID          NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT stores_email_unique  UNIQUE (email),
  CONSTRAINT fk_stores_owner      FOREIGN KEY (owner_id)
                                  REFERENCES users (id)
                                  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stores_name      ON stores (name);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id  ON stores (owner_id);


-- ────────────────────────────────────────────────────────────
-- TABLE: ratings
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ratings (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID          NOT NULL,
  user_id     UUID          NOT NULL,
  rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- One rating per user per store
  CONSTRAINT ratings_user_store_unique UNIQUE (user_id, store_id),

  CONSTRAINT fk_ratings_store FOREIGN KEY (store_id)
                               REFERENCES stores (id)
                               ON DELETE CASCADE,

  CONSTRAINT fk_ratings_user  FOREIGN KEY (user_id)
                               REFERENCES users (id)
                               ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings (store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id  ON ratings (user_id);


-- ────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at ON ratings
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON ratings;
CREATE TRIGGER trg_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ────────────────────────────────────────────────────────────
-- SEED: First Admin User
-- Email:    admin@example.com
-- Password: Admin@1234
-- ────────────────────────────────────────────────────────────

INSERT INTO users (id, name, email, password, address, role, created_at)
VALUES (
  gen_random_uuid(),
  'System Administrator Account',
  'admin@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGnFBFUoRoTfNhiGtNrHxNBPvtq',
  'Admin Office, Main Street',
  'admin',
  NOW()
)
ON CONFLICT (email) DO NOTHING; -- safe to run multiple times


-- ────────────────────────────────────────────────────────────
-- SEED: Sample Store Owner
-- Email:    owner@example.com
-- Password: Owner@1234
-- ────────────────────────────────────────────────────────────

INSERT INTO users (id, name, email, password, address, role, created_at)
VALUES (
  gen_random_uuid(),
  'Sample Store Owner User Account',
  'owner@example.com',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '456 Business Avenue, Commerce City',
  'store_owner',
  NOW()
)
ON CONFLICT (email) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: Sample Normal User
-- Email:    user@example.com
-- Password: User@1234
-- ────────────────────────────────────────────────────────────

INSERT INTO users (id, name, email, password, address, role, created_at)
VALUES (
  gen_random_uuid(),
  'Sample Normal User Account Here',
  'user@example.com',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '789 Residential Lane, Suburb Town',
  'user',
  NOW()
)
ON CONFLICT (email) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: Sample Store (linked to sample store owner)
-- ────────────────────────────────────────────────────────────

INSERT INTO stores (id, name, email, address, owner_id, created_at)
SELECT
  gen_random_uuid(),
  'The Grand Sample Store',
  'contact@grandsamplestore.com',
  '123 Main Street, Downtown District',
  u.id,
  NOW()
FROM users u
WHERE u.email = 'owner@example.com'
ON CONFLICT (email) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- VERIFY: Show created tables and row counts
-- ────────────────────────────────────────────────────────────

SELECT
  'users'   AS table_name, COUNT(*) AS rows FROM users
UNION ALL
SELECT
  'stores'  AS table_name, COUNT(*) AS rows FROM stores
UNION ALL
SELECT
  'ratings' AS table_name, COUNT(*) AS rows FROM ratings;
