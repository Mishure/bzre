# Vercel Deployment Setup

## Environment Variables

Go to your Vercel project: **Settings > Environment Variables**

Add the following variables for **Production, Preview, and Development** environments:

### Database

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.lrywxojospwerllzjifz:khYSSEej8tXsERBp@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.lrywxojospwerllzjifz:khYSSEej8tXsERBp@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require` |

### NextAuth

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | **Replace with your Vercel URL** (e.g., `https://buzau-realestate.vercel.app`) |
| `NEXTAUTH_SECRET` | `dWPjciG3tPeYlch3ndEw17qJfC4+2sfMciYe6gFiQEE=` |

### Admin Credentials

| Variable | Value |
|----------|-------|
| `ADMIN_EMAIL` | `admin@bestinvestcamimob.ro` |
| `ADMIN_PASSWORD` | `Admin123!` |

### Supabase (Optional)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lrywxojospwerllzjifz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Get from Supabase Dashboard > Settings > API |

## Quick Copy Format

You can also copy from `.env.production` file and paste directly into Vercel.

## Important Notes

1. **After deployment**, update `NEXTAUTH_URL` with your actual Vercel URL
2. All variables should be added to **Production**, **Preview**, and **Development** environments
3. The database is already seeded with an admin user - you can login with:
   - Email: `admin@bestinvestcamimob.ro`
   - Password: `Admin123!`

## Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
