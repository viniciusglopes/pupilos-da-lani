import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Buscar pessoas ativas com fotos e videos usando biblioteca oficial
    const { data: modelos, error } = await supabase
      .from('pessoas')
      .select(`
        *,
        fotos(*),
        videos(*)
      `)
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('❌ Erro listagem:', error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        code: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      modelos: modelos || [],
      total: modelos?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Erro GET modelos:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = verifyAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

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

    // Inserir usando biblioteca oficial
    const payload = {
      ...formData,
      data_consentimento: formData.consentimento_contato ? new Date().toISOString() : null
    }
    
    const { data: pessoa, error } = await supabaseAdmin
      .from('pessoas')
      .insert(payload)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        code: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      pessoa,
      message: `Pupilo "${pessoa.nome}" cadastrado com sucesso!`
    })

  } catch (error: any) {
    console.error('💥 Erro geral na API:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}