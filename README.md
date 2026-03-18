# Seaitall

**The world's fishing marketplace.**

Buy and sell fishing gear, find charters, book guides, and learn to fish — all in one place. Seaitall is the one stop shop for everything fishing.

## What it is

Seaitall is a full-stack fishing marketplace built on Next.js and Supabase. Fishermen can list used gear for sale, browse thousands of listings, find licensed captains, and book guided trips — without leaving the platform.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (Postgres + Row Level Security)
- **Storage:** Supabase Storage (listing photos)
- **Styling:** Tailwind CSS v4 + inline styles
- **Fonts:** Playfair Display + DM Sans (Google Fonts)

## Features

- Email/password authentication with Supabase Auth
- Gear listings with photo upload, category, condition, price, and location
- Browse page with search and category filtering (Rods, Reels, Lures, Line, Tackle Boxes, Boats, Engines, Other)
- Protected routes — only signed-in users can post listings
- Mobile-first responsive layout with bottom navigation

## Getting Started

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and add your Supabase credentials
3. Run `supabase-schema.sql` in your Supabase SQL editor to create the `listings` table and storage bucket
4. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

In your Supabase project:

1. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
2. Go to **Authentication → URL Configuration** and set the redirect URL to `http://localhost:3000/auth/callback`
3. Copy your **Project URL** and **anon key** from **Settings → API** into `.env.local`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deploy

Deploy to Vercel in one click. Add your environment variables in the Vercel dashboard and update your Supabase redirect URLs to include your production domain.
