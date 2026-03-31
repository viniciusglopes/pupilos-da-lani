import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface CamposVisibilidade {
  mostrar_altura: boolean
  mostrar_medidas: boolean
  mostrar_olhos: boolean
  mostrar_cabelo: boolean
  mostrar_localizacao: boolean
  mostrar_especializacoes: boolean
  mostrar_descricao: boolean
  mostrar_contatos: boolean
}

const DEFAULTS: CamposVisibilidade = {
  mostrar_altura: true,
  mostrar_medidas: true,
  mostrar_olhos: true,
  mostrar_cabelo: true,
  mostrar_localizacao: true,
  mostrar_especializacoes: true,
  mostrar_descricao: true,
  mostrar_contatos: true
}

export async function GET() {
  try {
    // Try to load from database first
    const { data, error } = await supabaseAdmin
      .from('config_sistema')
      .select('valor')
      .eq('chave', 'campos_visibilidade_pupilo')
      .single()

    if (data?.valor) {
      return NextResponse.json({
        success: true,
        campos: JSON.parse(data.valor)
      })
    }

    // Return defaults if not found
    return NextResponse.json({
      success: true,
      campos: DEFAULTS
    })
  } catch (error) {
    console.error('Erro ao carregar campos visibilidade:', error)
    
    // Return defaults on error
    return NextResponse.json({
      success: true,
      campos: DEFAULTS
    })
  }
}

export async function POST(request: Request) {
  try {
    const { campos } = await request.json()

    if (!campos || typeof campos !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Validate all required fields
    const requiredFields = [
      'mostrar_altura',
      'mostrar_medidas', 
      'mostrar_olhos',
      'mostrar_cabelo',
      'mostrar_localizacao',
      'mostrar_especializacoes',
      'mostrar_descricao',
      'mostrar_contatos'
    ]

    for (const field of requiredFields) {
      if (typeof campos[field] !== 'boolean') {
        return NextResponse.json(
          { success: false, error: `Campo ${field} deve ser boolean` },
          { status: 400 }
        )
      }
    }

    // Save to database
    const { error } = await supabaseAdmin
      .from('config_sistema')
      .upsert({
        chave: 'campos_visibilidade_pupilo',
        valor: JSON.stringify(campos),
        descricao: 'Controla quais campos são exibidos na página individual do pupilo'
      })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Configuração salva com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao salvar campos visibilidade:', error)
    
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}