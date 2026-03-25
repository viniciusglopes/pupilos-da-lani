import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Missing environment variables',
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Pupilos da Lani API is healthy',
      timestamp: new Date().toISOString(),
      environment: {
        supabase_configured: !!supabaseUrl,
        admin_configured: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}