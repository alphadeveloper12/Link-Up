import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANT
 * Use your *publishable/anon* key only here (safe for browser).
 * Do NOT use the service_role key in client code.
 */
const SUPABASE_URL  = 'https://vjpqqsrdtepbvckihekl.supabase.co';
const SUPABASE_ANON = 'sb_publishable_LVqfD06tBkUTGT6vfB5hNw_gis6tnm0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true }
});