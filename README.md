# polyparlay.fun - Parlay Layer for Polymarket

Non-custodial parlay layer for Polymarket. Create combined bets (parlays) across multiple Polymarket markets with real orders executed directly on Polymarket.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **Authentication**: Wallet connection (MetaMask/WalletConnect)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `DATABASE_URL`.

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/              # Next.js App Router pages
    api/           # API routes
  lib/             # Shared utilities
  server/          # Backend service layers
    polymarket/    # Polymarket API clients
    parlay/        # Parlay business logic
  components/      # React components
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/markets` - Get active markets from Polymarket
- `POST /api/parlays` - Create a new parlay
- `GET /api/parlays?userAddress=...` - Get user's parlays
- `POST /api/parlays/:id/submit-orders` - Submit signed orders to Polymarket
- `POST /api/parlays/:id/refresh` - Refresh parlay status
- `GET /api/debug/status` - Debug endpoint for system status

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
  - For Docker: `postgresql://polyexp:polyexp@localhost:5432/polyexp?schema=public`
  - For external DB: `postgresql://user:password@host:5432/polyexp?schema=public`

- `NEXT_PUBLIC_APP_URL` - Application URL (default: `http://localhost:3000`)

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (get from https://cloud.walletconnect.com)

Optional:
- `POLYMARKET_API_KEY` - API key for Polymarket (if required)

## Local Development with Docker

1. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

2. Copy environment file:
   ```bash
   cp env.example .env
   ```
   Edit `.env` and set your `DATABASE_URL` (already configured for Docker).

3. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

4. Run migrations:
   ```bash
   npm run db:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open debug dashboard:
   - http://localhost:3000/debug - System status and smoke test
   - http://localhost:3000/api/health - Health check
   - http://localhost:3000/api/markets - Markets API
   - http://localhost:3000/app - Main application

## License

MIT

