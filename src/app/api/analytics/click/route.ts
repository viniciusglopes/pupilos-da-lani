import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

const VALID_SOURCES = ['homepage', 'busca', 'parceria', 'destaque', 'direct']

export async function POST(request: NextRequest) {
  try {
    const { pupilo_id, source: rawSource } = await request.json()

    if (!pupilo_id) {
      return NextResponse.json({ success: false, error: 'pupilo_id é obrigatório' }, { status: 400 })
    }

    const source = VALID_SOURCES.includes(rawSource) ? rawSource : 'direct'
    const click_date = new Date().toISOString().split('T')[0]

    // Buscar registro existente
    const { data: existing } = await supabase
      .from('pupilo_clicks')
      .select('id, click_count')
      .eq('pupilo_id', pupilo_id)
      .eq('click_date', click_date)
      .eq('source', source)
      .maybeSingle()

    if (existing) {
      const { data } = await supabase
        .from('pupilo_clicks')
        .update({ click_count: existing.click_count + 1 })
        .eq('id', existing.id)
        .select()
        .single()
      return NextResponse.json({ success: true, data })
    }

    // Inserir novo registro
    const { data, error } = await supabase
      .from('pupilo_clicks')
      .insert({ pupilo_id, click_date, source, click_count: 1 })
      .select()
      .single()

    if (error) {
      // Se falhou por constraint (race condition), tenta incrementar
      if (error.code === '23505') {
        const { data: existing2 } = await supabase
          .from('pupilo_clicks')
          .select('id, click_count')
          .eq('pupilo_id', pupilo_id)
          .eq('click_date', click_date)
          .eq('source', source)
          .maybeSingle()
        if (existing2) {
          const { data: updated } = await supabase
            .from('pupilo_clicks')
            .update({ click_count: existing2.click_count + 1 })
            .eq('id', existing2.id)
            .select()
            .single()
          return NextResponse.json({ success: true, data: updated })
        }
      }
      return NextResponse.json({ success: false, error: 'Erro ao registrar clique' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
