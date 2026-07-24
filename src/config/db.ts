import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
// Prioritize service key to bypass RLS on the backend, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Database] Warning: SUPABASE_URL or SUPABASE_KEY is missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
