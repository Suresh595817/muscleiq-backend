import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Database] Warning: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
