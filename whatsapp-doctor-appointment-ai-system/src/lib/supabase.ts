import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})