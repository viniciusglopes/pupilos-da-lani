import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/analytics/clicks?pupilo_id=xxx&days=30&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pupilo_id = searchParams.get('pupilo_id')
    const days = parseInt(searchParams.get('days') || '30')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const fromDate = date_from || new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
    const toDate = date_to || new Date().toISOString().split('T')[0]

    // Totais por pupilo
    let totalsQuery = supabaseAdmin
      .from('pupilo_clicks')
      .select('pupilo_id, click_count, click_date, pessoas!inner(nome, foto_principal)')
      .gte('click_date', fromDate)
      .lte('click_date', toDate)
      .order('click_date', { ascending: false })

    if (pupilo_id) {
      totalsQuery = totalsQuery.eq('pupilo_id', pupilo_id)
    }

    const { data: clicksRaw, error } = await totalsQuery

    if (error) throw error

    // Agrupa por pupilo
    const byPupilo: Record<string, { pupilo_id: string; nome: string; foto: string; total: number; por_dia: { data: string; cliques: number }[] }> = {}

    for (const row of (clicksRaw || [])) {
      const pessoa = row.pessoas as any
      if (!byPupilo[row.pupilo_id]) {
        byPupilo[row.pupilo_id] = {
          pupilo_id: row.pupilo_id,
          nome: pessoa?.nome || 'Desconhecido',
          foto: pessoa?.foto_principal || '',
          total: 0,
          por_dia: []
        }
      }
      byPupilo[row.pupilo_id].total += row.click_count
      byPupilo[row.pupilo_id].por_dia.push({
        data: row.click_date,
        cliques: row.click_count
      })
    }

    const ranking = Object.values(byPupilo)
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({ success: true, ranking, periodo: { from: fromDate, to: toDate } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
