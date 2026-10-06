import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TrainingResult = {
  id?: string;
  user_id: string;
  game_type: 'slalom' | 'figure_eight';
  difficulty: 'easy' | 'medium' | 'hard';
  duration_seconds: number;
  score: number;
  accuracy: number;
  correct_passes: number;
  total_cones: number;
  longest_streak: number;
  challenge_version: string;
  input_mode: 'camera' | 'demo';
  session_id: string;
  created_at?: string;
};

export type UserProfile = {
  id: string;
  nickname: string;
  created_at?: string;
  updated_at?: string;
};
