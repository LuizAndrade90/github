# Supabase Setup Guide

This guide will help you set up the Supabase backend for PaceFlow.

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Supabase CLI (optional but recommended)

## Setup Steps

### 1. Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: PaceFlow
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier works for development
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon/public** key

3. Add these to your `.env` file in the root of the project:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 3. Run Database Migrations

You have two options to set up the database schema:

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to SQL Editor in your Supabase project
2. Open `supabase/migrations/20250101000000_initial_schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run"
6. Repeat for `supabase/migrations/20250101000001_seed_standard_guides.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Verify Setup

After running the migrations, verify in your Supabase dashboard:

1. Go to **Table Editor**
2. You should see these tables:
   - users
   - user_profiles
   - standard_guides
   - custom_guides
   - running_sessions

3. Go to **Authentication > Policies**
4. Verify Row Level Security (RLS) policies are enabled

5. Check the `standard_guides` table has 5 training guides:
   - Couch to 5K
   - 10K Training Plan
   - Half Marathon Prep
   - Marathon Training
   - Speed & Interval Training

### 5. Configure Google OAuth (for next step)

This will be configured in Step 3 of the development process.

## Database Schema Overview

### Tables

- **users**: User account information and subscription status
- **user_profiles**: User fitness profile (level, goals, limitations)
- **standard_guides**: Pre-made training programs (5 guides included)
- **custom_guides**: AI-generated personalized training plans
- **running_sessions**: Individual running session logs

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Standard guides are publicly readable
- All policies are defined in the migration file

## Troubleshooting

### Error: "Missing Supabase environment variables"

Make sure you've created a `.env` file in the project root with:
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Error: "relation does not exist"

Run the migrations in the correct order:
1. First: `20250101000000_initial_schema.sql`
2. Second: `20250101000001_seed_standard_guides.sql`

### No data in standard_guides table

Make sure you ran the seed migration: `20250101000001_seed_standard_guides.sql`

## Next Steps

Once Supabase is set up, proceed to Step 3: Authentication (Google OAuth)
