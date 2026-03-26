import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    console.log('🚀 API /modelos iniciada')
    
    const formData = await request.json()
    console.log('📝 Dados recebidos:', { nome: formData.nome, email: formData.email })
    
    // Validações básicas
    if (!formData.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (formData.email && !formData.consentimento_contato) {
      return NextResponse.json({ 
        error: 'Para cadastrar email, é necessário consentimento de contato' 
      }, { status: 400 })
    }

    if (formData.telefone && !formData.consentimento_contato) {
      return NextResponse.json({ 
        error: 'Para cadastrar telefone, é necessário consentimento de contato' 
      }, { status: 400 })
    }

    console.log('🔑 Verificando supabaseAdmin...')
    console.log('🔑 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'fallback')
    console.log('🔑 Service Key existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Inserir pessoa usando supabaseAdmin (bypassa RLS)
    console.log('💾 Tentando inserir no Supabase...')
    const { data: pessoa, error: pessoaError } = await supabaseAdmin
      .from('pessoas')
      .insert([{
        ...formData,
        data_consentimento: formData.consentimento_contato ? new Date().toISOString() : null
      }])
      .select()
      .single()

    if (pessoaError) {
      console.error('❌ Erro Supabase:', pessoaError)
      return NextResponse.json({ 
        error: pessoaError.message,
        debug_hint: pessoaError.hint || 'Erro no banco de dados'
      }, { status: 500 })
    }

    console.log('✅ Pessoa criada com sucesso:', pessoa.id)
    return NextResponse.json({ 
      success: true, 
      pessoa,
      message: `Modelo "${pessoa.nome}" cadastrado com sucesso!`
    })

  } catch (error: any) {
    console.error('💥 Erro geral na API:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor',
      debug_stack: error.stack?.split('\n')[0] || 'No stack trace'
    }, { status: 500 })
  }
}