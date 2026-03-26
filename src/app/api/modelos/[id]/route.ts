import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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