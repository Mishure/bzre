# Vercel Deployment Setup

## Environment Variables

Go to your Vercel project: **Settings > Environment Variables**

Add the following variables for **Production, Preview, and Development** environments:

### Database

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Get from Supabase: Dashboard > Settings > Database > Connection pooling |
| `DIRECT_URL` | Get from Supabase: Dashboard > Settings > Database > Connection string (Direct connection) |

### NextAuth

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | **Replace with your Vercel URL** (e.g., `https://your-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |

### Admin Credentials

| Variable | Value |
|----------|-------|
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your secure admin password |

### Supabase (Optional)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Get from Supabase: Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Get from Supabase: Dashboard > Settings > API (anon/public key) |

## Quick Copy Format

You can also copy from `.env.production` file and paste directly into Vercel.

## Important Notes

1. **After deployment**, update `NEXTAUTH_URL` with your actual Vercel URL
2. All variables should be added to **Production**, **Preview**, and **Development** environments
3. The database is already seeded with an admin user - you can login with:
   - Email: `contact@camimob.ro`
   - Password: `Admin123!`

## Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
