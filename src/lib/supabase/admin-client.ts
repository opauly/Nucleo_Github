import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('🔍 Admin Client Debug:')
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
  console.log('Service Key length:', supabaseServiceKey?.length || 0)

  if (!supabaseUrl || !supabaseServiceKey ||
      supabaseUrl === 'your_supabase_url_here' ||
      supabaseServiceKey === 'your_service_role_key_here') {
    console.warn('Supabase service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.')
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
