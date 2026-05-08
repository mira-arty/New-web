# Deployment Guide — Timer.mn

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Vercel CLI (optional): `npm i -g vercel`

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all required values:
   - **Supabase**: Get from Project Settings → API
   - **Mapbox**: Get from https://account.mapbox.com/access-tokens/
   - **NextAuth Secret**: Generate with `openssl rand -base64 32`
   - **App URL**: `http://localhost:3000` for local, `https://timer.mn` for prod

## Database Setup

1. Enable PostGIS extension in Supabase:
   ```sql
   create extension if not exists postgis;
   create extension if not exists pg_trgm;
   ```

2. Run schema from `lib/db/schema.sql`

3. Create storage buckets:
   - `business-photos`
   - `staff-avatars`
   - `profile-avatars`
   
   Set public access policies for each bucket.

4. Deploy Edge Function:
   ```bash
   cd supabase/functions/appointment-reminders
   supabase functions deploy appointment-reminders
   ```

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production Deployment (Vercel)

### Option 1: Vercel Dashboard

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables from `.env.local`
4. Deploy

### Option 2: Vercel CLI

```bash
vercel --prod
```

### Required Environment Variables on Vercel

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXT_PUBLIC_APP_URL` | Production URL |
| `QPAY_USERNAME` | QPay merchant username |
| `QPAY_PASSWORD` | QPay merchant password |
| `QPAY_INVOICE_CODE` | QPay invoice code |
| `SMS_API_KEY` | SMS API key (Unitel) |
| `SMS_API_SECRET` | SMS API secret |
| `SMS_SENDER_ID` | SMS sender ID |
| `SMS_API_URL` | SMS API endpoint |

## Post-Deployment

1. **Configure Cron Job**: Set up `/api/cron/appointment-reminders` to run every 30 minutes in Vercel dashboard

2. **Verify**: 
   - Homepage loads with map
   - Business registration works
   - Booking flow completes
   - SMS notifications send (or log to console)

3. **Monitoring**: Check Vercel Analytics and Supabase Logs

## Rollback

```bash
vercel --prod --archive
```

Or revert to previous deployment in Vercel dashboard.
