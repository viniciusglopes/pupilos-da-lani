import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🧪 Teste Supabase direto na API')
    
    const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co'
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk'
    
    console.log('🔑 Criando cliente Supabase...')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('📡 Testando conexão...')
    const { data, error } = await supabase
      .from('pessoas')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        hint: error.hint
      })
    }
    
    console.log('✅ Sucesso:', data?.length || 0, 'registros')
    return NextResponse.json({ 
      success: true, 
      records: data?.length || 0,
      sample: data?.[0] || null
    })
    
  } catch (error: any) {
    console.error('💥 Erro geral:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack?.split('\n')[0]
    }, { status: 500 })
  }
}