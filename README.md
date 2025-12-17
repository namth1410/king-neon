# King Neon - Custom Neon Sign E-commerce Platform

A full-stack e-commerce platform for custom neon signs, inspired by [Kings Of Neon](https://kingsofneon.com).

## Tech Stack

| Layer       | Technology                |
| ----------- | ------------------------- |
| Frontend    | Next.js 15.x + TypeScript |
| Admin       | Next.js 15.x + TypeScript |
| Backend API | NestJS + TypeScript       |
| CMS         | Strapi v4                 |
| Database    | PostgreSQL                |
| Cache       | Redis                     |
| Storage     | MinIO                     |

## Project Structure

```
king-neon/
├── apps/
│   ├── web/      # Public website (Next.js)
│   ├── admin/    # Admin panel (Next.js)
│   ├── api/      # Backend API (NestJS)
│   └── cms/      # Content management (Strapi)
├── packages/
│   ├── shared/   # Shared types & utilities
│   └── ui/       # Shared UI components
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start Docker services (PostgreSQL, Redis, MinIO)
pnpm docker:up

# Start all apps in development mode
pnpm dev
```

### Individual Apps

```bash
# Web (public site)
pnpm dev:web      # http://localhost:3000

# Admin panel
pnpm dev:admin    # http://localhost:3001

# API
pnpm dev:api      # http://localhost:4000

# CMS
pnpm dev:cms      # http://localhost:1338
```

## Docker Services

| Service       | Port | Description      |
| ------------- | ---- | ---------------- |
| PostgreSQL    | 5433 | Database         |
| Redis         | 6380 | Cache            |
| MinIO API     | 9002 | Object storage   |
| MinIO Console | 9003 | Storage admin UI |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## License

Private - All rights reserved.
