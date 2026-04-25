# SpreadPilot 🚀

SpreadPilot is a professional arbitrage monitoring platform for USDT/NGN traders. It scans multiple P2P pmarkets (Binance, Bybit, OKX, KuCoin) to find profitable spreads and sends real-time alerts.

## Features
- **Real-time Scanner**: Monitors P2P buy/sell prices across major exchanges.
- **Profit Calculation**: Automatic fee and slippage calculation.
- **Alert Dispatch**: Telegram notifications for Pro/Premium users.
- **Trade Journal**: Log and track your manual trades.
- **Subscription Gating**: Multi-tier access control (Free, Pro, Premium).

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in the required keys.

3. **Database Setup**:
   ```bash
   npm run db:push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Cron Jobs

The scanner and alert system run via an API route triggered by a Cron job. 

- **Endpoint**: `POST /api/jobs/run-scan`
- **Auth**: `Authorization: Bearer <CRON_SECRET>`

You can configure a GitHub Action or Vercel Cron to call this endpoint every 10 minutes.

## Deployment to Vercel

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Configure all environment variables listed in `src/lib/env.ts`.
4. Run `npm run db:push` to initialize your Neon database.
5. Set up your Paystack webhook to point to `your-domain.com/api/paystack/webhook`.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Neon (Postgres)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Payments**: Paystack
- **Styling**: Vanilla CSS + Tailwind
