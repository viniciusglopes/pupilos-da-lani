import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      environment: {
        // Client-side (NEXT_PUBLIC_*)
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        admin_password: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
        
        // Server-side (sem NEXT_PUBLIC_)
        service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        
        // Valores reais (mascarados) para debug
        env_sources: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'env' : 'fallback',
          anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'env' : 'fallback', 
          service: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'env' : 'fallback'
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}