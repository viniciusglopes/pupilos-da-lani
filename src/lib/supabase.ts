import { createClient } from '@supabase/supabase-js'

// EMERGENCY FALLBACK + DEBUG
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ljttishwndzkcytkdsrc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA'

console.log('🔧 SUPABASE CONFIG LOADED:')
console.log('URL source:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'env' : 'fallback')
console.log('KEY source:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'env' : 'fallback')
console.log('URL:', supabaseUrl)
console.log('KEY exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: No Supabase config available')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para operações admin (server-side)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjY2M30.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk'

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)