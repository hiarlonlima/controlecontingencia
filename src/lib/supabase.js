import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      })
    : null

export const hasSupabase = !!supabase

export const PROFILES_TABLE = 'fb_profiles'
export const BMS_TABLE = 'fb_bms'
