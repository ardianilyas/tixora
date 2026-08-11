# 🎫 Tixora – Support Ticket Management API

**Tixora** is a modern, high-performance Support Ticket Management System REST API built with **Express.js**, **TypeScript**, **Better Auth**, and **Prisma ORM** targeting **PostgreSQL**, running on **Bun**.

---

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM v7](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & [Supertest](https://github.com/ladjs/supertest)

---

## ✨ Features

- 🔐 **Authentication & RBAC**: Secure email/password auth managed by Better Auth, session validation, and Role-Based Access Control (`user`, `admin`).
- 🏷️ **Category Management**: Organize tickets by categories (Admin CRUD operations).
- 🎫 **Ticket Lifecycle**:
  - Automatic ticket code generation (e.g. `TXO-0001`).
  - Priority levels: `low`, `medium`, `high`, `critical`.
  - Status tracking: `open`, `in_progress`, `resolved`.
  - Assignee & Creator tracking.
- 🔍 **Filtering & Querying**: Search tickets by status, priority, ticket code, creator ID, or assignee ID.
- ⚡ **Type-Safe Architecture**: Full end-to-end type safety using TypeScript, Zod DTO validations, and custom Prisma client generation.

---

## 📂 Project Structure

```text
.
├── prisma/                 # Prisma schema & database configuration
│   └── schema.prisma       # Database models (User, Session, Category, Ticket, etc.)
├── src/
│   ├── feature/            # Feature modules (Domain-driven structure)
│   │   ├── category/       # Category controller, service, routes, DTOs & tests
│   │   └── ticket/         # Ticket controller, service, routes, DTOs & tests
│   ├── shared/             # Cross-cutting utilities & infrastructure
│   │   ├── config/         # Environment variables validation
│   │   ├── constants/      # App-wide constants & success messages
│   │   ├── errors/         # Custom AppError classes & handlers
│   │   ├── lib/            # Better Auth & Prisma client instances
│   │   ├── middlewares/    # Auth guards, role requirements, error handling
│   │   ├── routes/         # Primary API router registry
│   │   ├── seeder/         # Database seeders
│   │   ├── types/          # Express request extensions & global types
│   │   └── utils/          # Async handler wrapper, response formatters, Zod validator
│   └── server.ts           # Express server setup & app entry point
├── tests/                  # Integration tests & test setup helpers
├── generated/prisma/       # Generated Prisma Client output
├── vitest.config.ts        # Vitest test runner configuration
└── package.json            # Scripts & dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh/) installed (v1.x+)
- PostgreSQL instance running locally or via Docker

### 2. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tixora_db"
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Install Dependencies & Generate Database Client
```bash
bun install
bun run db:generate
```

### 4. Database Setup
Push the schema to your database:
```bash
bun run db:push
```

Optionally launch Prisma Studio to inspect the database:
```bash
bun run db:studio
```

### 5. Run Development Server
```bash
bun run dev
```
The server will start at `http://localhost:3000`.

### 6. Run Test Suite
```bash
bun test
```

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
Powered by **Better Auth**:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/sign-up/email` | Register a new user |
| `POST` | `/api/auth/sign-in/email` | Sign in with email and password |
| `POST` | `/api/auth/sign-out` | End session / sign out |
| `GET` | `/api/auth/get-session` | Get current active user session |

---

### 🏷️ Categories (`/api/categories`)
*Requires authenticated session for all routes. Modifying categories requires `admin` role.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Auth (`user`, `admin`) | List all categories |
| `GET` | `/api/categories/:id` | Admin | Get single category details |
| `POST` | `/api/categories` | Admin | Create a new category |
| `PATCH` | `/api/categories/:id` | Admin | Update existing category |
| `DELETE` | `/api/categories/:id` | Admin | Delete category |

**Create Category Body:**
```json
{
  "name": "Hardware",
  "description": "Issues related to workstations and physical devices"
}
```

---

### 🎫 Tickets (`/api/tickets`)
*Requires authenticated session.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tickets` | List tickets (Supports filtering via query params) |
| `GET` | `/api/tickets/:id` | Get single ticket details |
| `POST` | `/api/tickets` | Create a new support ticket |
| `PATCH` | `/api/tickets/:id` | Update ticket details/status |
| `DELETE` | `/api/tickets/:id` | Delete ticket |

#### Query Parameters for `GET /api/tickets`:
- `status`: `open` | `in_progress` | `resolved`
- `priority`: `low` | `medium` | `high` | `critical`
- `code`: Ticket code (e.g. `TXO-0001`)
- `creatorId`: Filter by creator User ID
- `assigneeId`: Filter by assigned User ID

**Create Ticket Request Body:**
```json
{
  "title": "Monitor flickering",
  "description": "Secondary screen keeps dropping connection on HDMI",
  "categoryId": "01J... (ULID)",
  "priority": "medium",
  "status": "open"
}
```

---

## 📜 License

MIT License.