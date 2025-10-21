-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired');
CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE goal_type AS ENUM ('5k', '10k', 'half_marathon', 'marathon', 'fitness');
CREATE TYPE guide_category AS ENUM ('beginner', 'distance', 'speed', 'endurance');
CREATE TYPE session_source AS ENUM ('manual', 'healthkit');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  google_id TEXT,
  subscription_status subscription_status DEFAULT 'trial',
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  fitness_level fitness_level,
  experience_level TEXT,
  goals goal_type[],
  injuries_limitations TEXT,
  preferred_training_days INTEGER CHECK (preferred_training_days >= 1 AND preferred_training_days <= 7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Standard guides table
CREATE TABLE public.standard_guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category guide_category NOT NULL,
  duration_weeks INTEGER NOT NULL,
  sessions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom guides table (AI-generated)
CREATE TABLE public.custom_guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  ai_generated_plan JSONB NOT NULL,
  input_parameters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Running sessions table
CREATE TABLE public.running_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID, -- Can reference either standard_guides or custom_guides
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  distance DECIMAL(10, 2), -- in kilometers
  duration INTEGER, -- in seconds
  pace DECIMAL(10, 2), -- minutes per kilometer
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  calories INTEGER,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  source session_source DEFAULT 'manual',
  healthkit_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_custom_guides_user_id ON public.custom_guides(user_id);
CREATE INDEX idx_running_sessions_user_id ON public.running_sessions(user_id);
CREATE INDEX idx_running_sessions_date ON public.running_sessions(date DESC);
CREATE INDEX idx_running_sessions_guide_id ON public.running_sessions(guide_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_running_sessions_updated_at BEFORE UPDATE ON public.running_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own user data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_profiles table
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for standard_guides table (public read access)
CREATE POLICY "Anyone can view standard guides" ON public.standard_guides
  FOR SELECT USING (true);

-- RLS Policies for custom_guides table
CREATE POLICY "Users can view own custom guides" ON public.custom_guides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom guides" ON public.custom_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom guides" ON public.custom_guides
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for running_sessions table
CREATE POLICY "Users can view own sessions" ON public.running_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.running_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.running_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.running_sessions
  FOR DELETE USING (auth.uid() = user_id);
