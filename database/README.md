# Database Setup

## Step 1 — Create the database

Open pgAdmin or psql and run:

```sql
CREATE DATABASE store_ratings;
```

## Step 2 — Run setup.sql

### Option A: pgAdmin (easiest)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click `store_ratings` database → **Query Tool**
4. Click the folder icon → open `setup.sql`
5. Press **F5** to run

### Option B: psql command line

```powershell
psql -U postgres -d store_ratings -f "C:\Users\bhuva\Downloads\store-ratings\database\setup.sql"
```

## What setup.sql creates

| Object | Description |
|---|---|
| `users` table | id, name, email, password, address, role, created_at |
| `stores` table | id, name, email, address, owner_id (FK), created_at |
| `ratings` table | id, store_id (FK), user_id (FK), rating 1–5, created_at, updated_at |
| Indexes | On name, email, role, store_id, user_id |
| Trigger | Auto-updates `updated_at` on ratings |

## Seed accounts created

| Email | Password | Role |
|---|---|---|
| admin@example.com | Admin@1234 | Admin |
| owner@example.com | Owner@1234 | Store Owner |
| user@example.com | User@1234 | Normal User |

## After running

Start the backend — TypeORM will connect to these tables automatically.
The `synchronize: true` setting in dev will add any missing columns but
will NOT drop existing ones, so running `setup.sql` first is safe.
