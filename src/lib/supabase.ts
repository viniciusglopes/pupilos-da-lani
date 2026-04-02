import { createClient } from '@supabase/supabase-js'

// Configuração segura - sem fallbacks expostos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables')
}

// Cliente público (client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin (server-side only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey, // fallback para anon se service role não disponível
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)