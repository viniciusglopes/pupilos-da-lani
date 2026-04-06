import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar pessoa específica com fotos e videos
    const { data: pessoa, error } = await supabaseAdmin
      .from('pessoas')
      .select(`
        *,
        fotos(*),
        videos(*)
      `)
      .eq('id', params.id)
      .eq('ativo', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pupilo não encontrado' }, { status: 404 })
      }
      console.error('Erro buscando pessoa:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, pupilo: pessoa })

  } catch (error: any) {
    console.error('Erro na API get:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = verifyAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Atualizar pessoa usando supabaseAdmin (bypassa RLS)
    const { data: pessoa, error: pessoaError } = await supabaseAdmin
      .from('pessoas')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (pessoaError) {
      console.error('Erro atualizando pessoa:', pessoaError)
      return NextResponse.json({ error: pessoaError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, pessoa })

  } catch (error: any) {
    console.error('Erro na API update:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}