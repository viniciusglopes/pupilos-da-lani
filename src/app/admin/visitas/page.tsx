'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface DailyStat {
  date: string
  total_visits: number
  unique_visitors: number
  unique_pages: number
}

interface PageStat {
  page_path: string
  visits: number
  unique_visitors: number
}

interface ReferrerStat {
  referrer: string
  visits: number
}

export default function AdminVisitasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [pageStats, setPageStats] = useState<PageStat[]>([])
  const [referrerStats, setReferrerStats] = useState<ReferrerStat[]>([])
  const [totals, setTotals] = useState({ visits: 0, unique_visitors: 0, pages_viewed: 0 })

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) {
      router.push('/login')
      return
    }
    loadVisitas()
  }, [router])

  useEffect(() => { loadVisitas() }, [days])

  const loadVisitas = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/visit?days=${days}`)
      if (!res.ok) return
      const json = await res.json()
      if (!json.success) return

      const raw = json.data.raw_data || []
      const summary: DailyStat[] = json.data.daily_summary || []

      summary.sort((a: DailyStat, b: DailyStat) => b.date.localeCompare(a.date))
      setDailyStats(summary)

      const totalVisits = summary.reduce((s: number, d: DailyStat) => s + d.total_visits, 0)
      const totalUnique = summary.reduce((s: number, d: DailyStat) => s + d.unique_visitors, 0)
      const allPages = new Set(raw.map((r: any) => r.page_path))
      setTotals({ visits: totalVisits, unique_visitors: totalUnique, pages_viewed: allPages.size })

      const byPage: Record<string, { visits: number; ips: Set<string> }> = {}
      for (const r of raw) {
        if (!byPage[r.page_path]) byPage[r.page_path] = { visits: 0, ips: new Set() }
        byPage[r.page_path].visits += r.visit_count
        byPage[r.page_path].ips.add(r.user_ip)
      }
      setPageStats(
        Object.entries(byPage)
          .map(([page_path, d]) => ({ page_path, visits: d.visits, unique_visitors: d.ips.size }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 20)
      )

      const byRef: Record<string, number> = {}
      for (const r of raw) {
        const ref = r.referrer || 'Direto'
        byRef[ref] = (byRef[ref] || 0) + r.visit_count
      }
      setReferrerStats(
        Object.entries(byRef)
          .map(([referrer, visits]) => ({ referrer, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 15)
      )
    } catch {}
    finally { setLoading(false) }
  }

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${day}/${m}`
  }

  const maxVisits = Math.max(...dailyStats.map(d => d.total_visits), 1)

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">Visitas do Site</h1>
            <p className="text-gray-500 mt-1 text-sm">Acessos, paginas e origens do trafego</p>
          </div>

          <div className="border border-gray-200 p-4 mb-6 flex gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Periodo</label>
              <select
                value={String(days)}
                onChange={e => setDays(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
              >
                <option value="7">Ultimos 7 dias</option>
                <option value="14">Ultimos 14 dias</option>
                <option value="30">Ultimos 30 dias</option>
                <option value="90">Ultimos 90 dias</option>
              </select>
            </div>
            <button onClick={loadVisitas}
              className="px-4 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800">
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total de Visitas</p>
                  <p className="text-3xl font-bold text-black">{totals.visits.toLocaleString('pt-BR')}</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Visitantes Unicos</p>
                  <p className="text-3xl font-bold text-black">{totals.unique_visitors.toLocaleString('pt-BR')}</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Paginas Visitadas</p>
                  <p className="text-3xl font-bold text-black">{totals.pages_viewed}</p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-black uppercase tracking-wide text-sm">Visitas por Dia</h2>
                </div>
                {dailyStats.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-400 text-sm">Nenhuma visita registrada neste periodo.</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-end gap-1 h-40">
                      {[...dailyStats].reverse().slice(-30).map((d, i) => (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                          <div
                            className="w-full bg-black hover:bg-gray-700 transition-colors cursor-default"
                            style={{ height: `${Math.max((d.total_visits / maxVisits) * 100, 4)}%` }}
                            title={`${formatDate(d.date)}: ${d.total_visits} visitas, ${d.unique_visitors} unicos`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {dailyStats.length > 0 ? formatDate(dailyStats[dailyStats.length - 1].date) : ''}
                      </span>
                      <span className="text-xs text-gray-400">
                        {dailyStats.length > 0 ? formatDate(dailyStats[0].date) : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top pages */}
                <div className="border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-black uppercase tracking-wide text-sm">Paginas Mais Acessadas</h2>
                  </div>
                  {pageStats.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Sem dados</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {pageStats.map((p, i) => (
                        <div key={p.page_path} className={`px-6 py-3 flex items-center justify-between ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-black truncate font-mono">{p.page_path}</p>
                            <p className="text-xs text-gray-400">{p.unique_visitors} visitantes unicos</p>
                          </div>
                          <span className="text-sm font-bold text-black ml-4">{p.visits}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Referrers */}
                <div className="border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-black uppercase tracking-wide text-sm">Origem do Trafego</h2>
                  </div>
                  {referrerStats.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Sem dados</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {referrerStats.map((r, i) => {
                        let label = r.referrer
                        try {
                          if (r.referrer.startsWith('http')) label = new URL(r.referrer).hostname
                        } catch {}
                        return (
                          <div key={r.referrer} className={`px-6 py-3 flex items-center justify-between ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                            <p className="text-sm text-black truncate flex-1 min-w-0">{label}</p>
                            <span className="text-sm font-bold text-black ml-4">{r.visits}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Daily table */}
              <div className="border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-black uppercase tracking-wide text-sm">Detalhamento Diario</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitas</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unicos</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paginas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dailyStats.map((d, i) => (
                        <tr key={d.date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-3 text-sm text-gray-700">{formatDate(d.date)}</td>
                          <td className="px-6 py-3 text-sm font-medium text-black">{d.total_visits}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{d.unique_visitors}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{d.unique_pages}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
