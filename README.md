# JumpFun

A bounce house rental marketplace — browse, save, and book inflatables from local rental companies.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (Postgres)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Features

- Browse bounce houses, water slides, combos, and more by category
- Search and filter by category, theme, price, and city
- Save favourites (stored in localStorage)
- Book items via a 3-step booking form
- AI Planner for personalized rental recommendations
- Hand-picked featured listings on the home page
- Company profile pages

## Project Structure

```
src/
  app/                  # Next.js pages
    api/
      listings/         # Batch fetch listings by IDs
      booking/          # Booking form submission (logs server-side)
    browse/             # Browse & filter page
    booking/            # 3-step booking form
    favorites/          # Saved items page
    items/[id]/         # Item detail page
    companies/[site]/   # Company profile page
    plan/               # AI Planner page
  components/           # Shared UI components
  context/              # CityContext (user's location)
  lib/
    data.ts             # Supabase data fetching functions
    favorites.ts        # localStorage favorites helpers
    supabase.ts         # Supabase client
    geo.ts              # City detection & suggestions
  types/                # TypeScript types
```

## Database Tables (Supabase)

| Table | Description |
|---|---|
| `app_listings` | Rental items |
| `app_businesses` | Rental companies |
| `app_categories` | Categories with listing counts |
| `app_listing_images` | Item photos |
| `app_listing_prices` | Pricing tiers |
| `app_service_areas` | Cities each company serves |
| `featured_listings` | Hand-picked featured items for home page |

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Not yet deployed. Planned for Vercel.
