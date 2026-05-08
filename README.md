# Timer.mn

Mongolia's multi-tenant appointment booking platform — connecting customers with local businesses (hair salons, beauty spas, dental clinics, yoga studios, and more).

## Architecture Overview

Timer.mn is a **dual-portal web application** built on a modern, scalable architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                     │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │   B2C Portal    │              │   B2B Portal    │       │
│  │   (Customers)   │              │  (Businesses)   │       │
│  │                 │              │                 │       │
│  │ • Search/Map    │              │ • Dashboard     │       │
│  │ • Bookings      │              │ • Staff Mgmt    │       │
│  │ • Payments      │              │ • Schedule      │       │
│  │ • Reviews       │              │ • Services      │       │
│  └────────┬────────┘              └────────┬────────┘       │
│           │                                │                │
│           └────────────────┬───────────────┘                │
│                            │                                │
│              Next.js 14 App Router                         │
│              (Server Components + RSC)                     │
│                            │                                │
│           ┌────────────────┼────────────────┐              │
│           │                │                │              │
│      Supabase Auth    Supabase DB      Supabase            │
│      (JWT/OAuth)   (PostgreSQL)      Realtime            │
│           │                │                │              │
│           └────────────────┴────────────────┘              │
│                            │                                │
│              ┌─────────────┴─────────────┐                 │
│              │                           │                 │
│         Mapbox GL JS              QPay / SocialPay        │
│         (Interactive Map)         (Mongolian Payments)    │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | SSR/SSG, API routes, file-system routing |
| **Language** | TypeScript | Type safety across the entire stack |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS, accessible UI components |
| **Database** | Supabase (PostgreSQL) | Relational data, real-time subscriptions |
| **Auth** | Supabase Auth + NextAuth.js | Multi-role authentication (customer/business/admin) |
| **Maps** | Mapbox GL JS | Interactive business discovery map |
| **Payments** | QPay + SocialPay | Mongolian payment processing |
| **State** | Zustand | Lightweight global state management |
| **Animation** | Framer Motion | UI transitions and micro-interactions |
| **Icons** | Lucide React | Consistent iconography |
| **Deployment** | Vercel | Edge network, serverless functions |

## Project Structure

```
timer-mn/
├── app/                          # Next.js App Router
│   ├── (b2c)/                   # B2C Portal — Customer-facing routes
│   │   ├── page.tsx              # Homepage (map + search)
│   │   ├── search/               # Search results
│   │   ├── business/[id]/        # Business profile page
│   │   ├── booking/[id]/         # Booking flow + payment
│   │   └── profile/              # Customer account
│   ├── (b2b)/                   # B2B Portal — Business owner routes
│   │   ├── dashboard/            # Overview, stats, calendar
│   │   ├── staff/                # Staff management
│   │   ├── services/             # Service catalog
│   │   ├── schedule/             # Availability calendar
│   │   └── bookings/             # Booking management
│   ├── api/                     # API Routes
│   │   ├── auth/[...nextauth]/   # Authentication
│   │   ├── business/             # Business CRUD
│   │   ├── booking/              # Booking operations
│   │   ├── payment/              # Payment processing
│   │   └── webhook/              # Payment webhooks
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles + Tailwind
│
├── components/                   # React Components
│   ├── b2c/                     # B2C-specific components
│   │   ├── map/                  # Mapbox integration
│   │   ├── search/               # Search & filters
│   │   ├── business-card/        # Business listing cards
│   │   └── booking-form/         # Appointment booking
│   ├── b2b/                     # B2B-specific components
│   │   ├── dashboard/            # Stats & charts
│   │   ├── staff-manager/        # Staff CRUD
│   │   ├── service-manager/      # Service CRUD
│   │   └── schedule-calendar/    # Calendar & availability
│   └── ui/                      # Shared shadcn/ui components
│
├── lib/                         # Shared Libraries
│   ├── types/                    # TypeScript interfaces
│   │   └── index.ts              # All domain types
│   ├── db/                       # Database layer
│   │   ├── supabase.ts           # Supabase client
│   │   └── schema.sql            # Database schema
│   ├── auth/                     # Auth configuration
│   │   └── auth-config.ts        # NextAuth + Supabase setup
│   ├── payments/                 # Payment integrations
│   │   ├── qpay.ts               # QPay API client
│   │   └── socialpay.ts          # SocialPay API client
│   ├── maps/                     # Mapbox configuration
│   │   └── mapbox.ts             # Mapbox token + helpers
│   └── utils/                    # Utility functions
│       └── helpers.ts            # Date, currency formatters
│
├── hooks/                       # Custom React Hooks
│   ├── use-business.ts           # Business data fetching
│   ├── use-booking.ts            # Booking state management
│   └── use-location.ts           # Geolocation hook
│
├── stores/                      # Zustand Stores
│   └── app-store.ts              # Global app state
│
├── public/                      # Static Assets
│   └── images/                   # Images, logos, icons
│
├── styles/                      # Styles
│   └── tailwind.config.ts        # Tailwind configuration
│
├── middleware.ts                # Route protection & auth
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript configuration
```

## Key Design Decisions

### 1. Route Groups for Dual Portals
The `(b2c)` and `(b2b)` route groups allow distinct layouts for each portal while sharing the same Next.js application. This enables:
- Separate navigation structures
- Different authentication requirements
- Optimized bundle splitting per portal

### 2. Multi-Tenant Data Model
All entities (`Business`, `Service`, `Staff`, `Booking`) include a `businessId` foreign key, ensuring strict data isolation between tenants. Row Level Security (RLS) policies in Supabase enforce this at the database level.

### 3. Real-Time Updates
Supabase Realtime subscriptions enable:
- Instant booking notifications for business owners
- Live availability updates as appointments are booked
- Synchronized calendar views across devices

### 4. Mongolian Payment Integration
Native support for QPay (bank transfer/QR) and SocialPay (mobile wallet) ensures seamless payment experiences for Mongolian customers, with webhook handlers for asynchronous payment confirmation.

### 5. Geo-Spatial Search
PostGIS extension in PostgreSQL + Mapbox GL JS enables:
- Location-based business discovery
- Radius search with distance calculation
- Interactive map clustering for dense areas

## Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# Payments
QPAY_MERCHANT_ID=your-qpay-merchant-id
QPAY_SECRET=your-qpay-secret
SOCIALPAY_MERCHANT_ID=your-socialpay-merchant-id
SOCIALPAY_SECRET=your-socialpay-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Next Steps

1. **Database Setup**: Execute `lib/db/schema.sql` in Supabase SQL Editor
2. **Auth Configuration**: Configure providers in `lib/auth/auth-config.ts`
3. **Payment Integration**: Add QPay/SocialPay API credentials
4. **Mapbox Token**: Add public token for map rendering
5. **Seed Data**: Create sample businesses, services, and staff

## License

Proprietary — Timer.mn
