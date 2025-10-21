// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Guides: undefined;
  Sessions: undefined;
  Profile: undefined;
};

export type GuidesStackParamList = {
  GuidesList: undefined;
  GuideDetail: {
    guideId: string;
  };
};

// User types
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalType = '5k' | '10k' | 'half_marathon' | 'marathon' | 'fitness';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';

export interface User {
  id: string;
  email: string;
  full_name: string;
  google_id?: string;
  subscription_status: SubscriptionStatus;
  subscription_end_date?: string;
  stripe_customer_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  fitness_level?: FitnessLevel;
  experience_level?: string;
  goals?: GoalType[];
  injuries_limitations?: string;
  preferred_training_days?: number;
  created_at: string;
  updated_at: string;
}

// Guide types
export interface GuideSession {
  week: number;
  day: number;
  type: string;
  description: string;
  distance?: number;
  duration?: number;
  notes?: string;
}

export interface StandardGuide {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'distance' | 'speed' | 'endurance';
  duration_weeks: number;
  sessions: GuideSession[];
  created_at: string;
}

export interface CustomGuide {
  id: string;
  user_id: string;
  title: string;
  ai_generated_plan: any;
  input_parameters: any;
  created_at: string;
}

// Running session types
export interface RunningSession {
  id: string;
  user_id: string;
  guide_id?: string;
  date: string;
  distance?: number;
  duration?: number;
  pace?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  calories?: number;
  notes?: string;
  completed: boolean;
  source: 'manual' | 'healthkit';
  healthkit_data?: any;
  created_at: string;
}
