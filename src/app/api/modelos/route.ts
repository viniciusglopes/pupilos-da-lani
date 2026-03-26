import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    
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

    // Inserir pessoa usando supabaseAdmin (bypassa RLS)
    const { data: pessoa, error: pessoaError } = await supabaseAdmin
      .from('pessoas')
      .insert([{
        ...formData,
        data_consentimento: formData.consentimento_contato ? new Date().toISOString() : null
      }])
      .select()
      .single()

    if (pessoaError) {
      console.error('Erro inserindo pessoa:', pessoaError)
      return NextResponse.json({ error: pessoaError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      pessoa,
      message: `Modelo "${pessoa.nome}" cadastrado com sucesso!`
    })

  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}