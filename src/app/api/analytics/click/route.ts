import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

const VALID_SOURCES = ['homepage', 'busca', 'parceria', 'destaque', 'direct']

// POST /api/analytics/click
export async function POST(request: NextRequest) {
  try {
    const { pupilo_id, source: rawSource } = await request.json()

    if (!pupilo_id) {
      return NextResponse.json(
        { success: false, error: 'pupilo_id é obrigatório' },
        { status: 400 }
      )
    }

    const source = VALID_SOURCES.includes(rawSource) ? rawSource : 'direct'
    const click_date = new Date().toISOString().split('T')[0]

    // Try to increment existing record first
    const { data: existing } = await supabase
      .from('pupilo_clicks')
      .select('id, click_count')
      .eq('pupilo_id', pupilo_id)
      .eq('click_date', click_date)
      .eq('source', source)
      .single()

    if (existing) {
      const { data } = await supabase
        .from('pupilo_clicks')
        .update({ click_count: existing.click_count + 1 })
        .eq('id', existing.id)
        .select()
        .single()
      return NextResponse.json({ success: true, data })
    }

    // Insert new record
    const { data, error } = await supabase
      .from('pupilo_clicks')
      .insert({ pupilo_id, click_date, source, click_count: 1 })
      .select()
      .single()

    if (error) {
      console.error('Error inserting click:', error)
      return NextResponse.json({ success: false, error: 'Erro ao registrar clique' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error in click analytics:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
