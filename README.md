# Store Ratings Platform

A full-stack web application where users browse and rate stores, store owners monitor their ratings, and admins manage the platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS + TypeORM |
| Database | PostgreSQL (via Docker) |
| Frontend | React + TypeScript + React Router |
| Auth | JWT (role-based) |
| HTTP Client | Axios |

---

## Roles

| Role | What they can do |
|---|---|
| `admin` | Manage all users and stores; view dashboard stats |
| `store_owner` | View their store's average rating and who rated them |
| `user` | Browse stores, submit and edit ratings |

Normal users self-register. Admins create store owners and other admins.

---

## Seed Accounts

These accounts are created by running `npx ts-node src/seed.ts` from the backend folder.

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@1234 |
| Store Owner | owner@example.com | Owner@1234 |
| Normal User | user@example.com | User@1234 |

> Passwords must be 8–16 characters, contain at least one uppercase letter and one special character.

---
## Screenshots
<img width="1920" height="968" alt="Screenshot (108)" src="https://github.com/user-attachments/assets/c09d1a4b-24a5-41a1-b01e-a719e4f12f7d" />

<br><br>

<img width="1920" height="962" alt="Screenshot (109)" src="https://github.com/user-attachments/assets/1ba67526-3d4e-422a-9191-6e7560090c60" />

<br><br>

<img width="1920" height="968" alt="Screenshot (110)" src="https://github.com/user-attachments/assets/237636c8-dfd4-4937-8203-a5c6582b7856" />

<br><br>

<img width="1920" height="965" alt="Screenshot (111)" src="https://github.com/user-attachments/assets/a56e70d5-a5b6-4623-af85-8c8bf5da9e2f" />

---

## Project Structure

```
store-ratings/
├── backend/
│   └── src/
│       ├── auth/           # JWT login + self-registration
│       ├── admin/          # Admin-only routes (users, stores, dashboard)
│       ├── users/          # Password change for user + store_owner
│       ├── stores/         # Store listing for normal users
│       ├── ratings/        # Submit + edit ratings
│       ├── owner/          # Store owner dashboard
│       ├── common/         # Guards, decorators, exception filter
│       └── seed.ts         # Seeds admin, owner, user, sample store
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── auth/       # Login, Register
│       │   ├── admin/      # Dashboard, Users list/detail, Stores list, Add forms
│       │   ├── user/       # Store listings with rating modal, Change password
│       │   └── owner/      # Owner dashboard, Change password
│       ├── components/     # Layout, Sidebar, StarRating, RatingModal, SortableTh
│       ├── context/        # AuthContext (JWT + user state)
│       ├── services/       # Axios instance with JWT interceptor
│       ├── utils/          # Client-side validators
│       └── routes/         # ProtectedRoute wrapper
├── database/
│   ├── setup.sql           # Manual DB schema + seed (alternative to seed.ts)
│   └── README.md           # pgAdmin / psql instructions
├── docker-compose.yml      # PostgreSQL container
└── README.md
```

---

## Full Setup Guide (Step by Step)

### Prerequisites
- Node.js 18+
- Docker Desktop (running)

---

### Step 1 — Start PostgreSQL via Docker

```powershell
cd C:\Users\bhuva\Downloads\store-ratings
docker-compose up -d
```

This starts a PostgreSQL 16 container named `store_ratings_db` on port `5432`.

---

### Step 2 — Backend Setup

```powershell
cd C:\Users\bhuva\Downloads\store-ratings\backend
cp .env.example .env
npm install
```

Edit `.env` — set your values (Docker defaults shown):

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=store_ratings

JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
```

> `DB_PASSWORD=password` matches the `POSTGRES_PASSWORD` in `docker-compose.yml`.

Start the backend:

```powershell
npm run dev
```

You should see:
```
Store Ratings API running on port 3001
```

---

### Step 3 — Seed the Database

In a new terminal (keep backend running):

```powershell
cd C:\Users\bhuva\Downloads\store-ratings\backend
npx ts-node src/seed.ts
```

Expected output:
```
✓ Admin created        — admin@example.com / Admin@1234
✓ Store owner created  — owner@example.com / Owner@1234
✓ Normal user created  — user@example.com  / User@1234
✓ Sample store created — The Grand Sample Store
```

> Safe to run multiple times — it detects existing accounts and resets their passwords.

---

### Step 4 — Frontend Setup

```powershell
cd C:\Users\bhuva\Downloads\store-ratings\frontend
npm install
npm start
```

Opens **http://localhost:3000** automatically.

---

## Running the App (After First Setup)

Open **3 terminals**:

| Terminal | Command |
|---|---|
| 1 | `docker-compose up -d` (only needed once per machine restart) |
| 2 | `cd backend && npm run dev` |
| 3 | `cd frontend && npm start` |

---

## API Reference

### Auth (public)
```
POST /auth/register     # Normal user self-registration
POST /auth/login        # All roles — returns JWT + user object
```

### Admin (role: admin)
```
GET  /admin/dashboard       # { totalUsers, totalStores, totalRatings }
POST /admin/users           # Create any user (any role)
GET  /admin/users           # List users — filters: name, email, address, role + sort
GET  /admin/users/:id       # User detail (store owners include their store avg rating)
GET  /admin/stores          # List stores with avg rating — filters + sort
POST /admin/stores          # Create store
GET  /admin/store-owners    # List store_owner users (for Add Store dropdown)
```

### User (role: user)
```
GET  /stores                # All stores with avg rating + my submitted rating
GET  /stores?search=        # Filter by name or address
POST /ratings               # Submit rating { store_id, rating: 1–5 }
PUT  /ratings/:id           # Edit existing rating
PUT  /users/me/password     # Change own password
```

### Store Owner (role: store_owner)
```
GET /owner/dashboard        # Store avg rating + list of all raters (name, email, rating)
PUT /users/me/password      # Change own password
```

---

## Validation Rules

| Field | Rule |
|---|---|
| Name | 20–60 characters |
| Email | Valid format (user@example.com) |
| Password | 8–16 chars, at least 1 uppercase letter, at least 1 special character |
| Address | Max 400 characters (optional on users) |
| Rating | Integer 1–5 only |

All rules enforced on both frontend (before submit) and backend (DTO validators).

---

## Environment Variables

```env
# backend/.env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password        # must match docker-compose POSTGRES_PASSWORD
DB_NAME=store_ratings

JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRES_IN=7d
```

---

## Known Issues Fixed

| Issue | Fix Applied |
|---|---|
| `npm install` failed on frontend with TypeScript 5 vs react-scripts peer conflict | Downgraded frontend TypeScript to `^4.9.5` |
| `tsconfig.json` missing in frontend | Added `frontend/tsconfig.json` |
| `AdminUserDetail.tsx` TS1117 duplicate style keys | Split into separate `valueStyle` variable |
| `validators.ts` TS2345 type error on generic validator call | Cast validator function explicitly as `(v: any) => string` |
| Seed account passwords not working (wrong bcrypt hashes in setup.sql) | Replaced static SQL hashes with `seed.ts` which hashes at runtime using the project's own bcrypt |

---

## Docker Reference

```powershell
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and delete all data (full reset)
docker-compose down -v

# Check container status
docker ps
```
