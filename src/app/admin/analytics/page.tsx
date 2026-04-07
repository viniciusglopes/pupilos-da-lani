'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface PupiloClicks {
  pupilo_id: string
  nome: string
  foto: string
  total: number
  por_dia: { data: string; cliques: number }[]
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [ranking, setRanking] = useState<PupiloClicks[]>([])
  const [loading, setLoading] = useState(true)
  const [pupiloFiltro, setPupiloFiltro] = useState('')
  const [days, setDays] = useState(30)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [usandoCustomDate, setUsandoCustomDate] = useState(false)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadAnalytics()
  }, [router])

  useEffect(() => {
    loadAnalytics()
  }, [days, dateFrom, dateTo, pupiloFiltro])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (pupiloFiltro) params.set('pupilo_id', pupiloFiltro)
      if (usandoCustomDate && dateFrom) params.set('date_from', dateFrom)
      if (usandoCustomDate && dateTo) params.set('date_to', dateTo)
      if (!usandoCustomDate) params.set('days', String(days))

      const res = await fetch(`/api/analytics/clicks?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRanking(data.ranking || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  const totalCliques = ranking.reduce((s, p) => s + p.total, 0)
  const pupiloDetalhado = pupiloFiltro ? ranking.find(p => p.pupilo_id === pupiloFiltro) : null
  const todosOsPupilos = ranking

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">Analytics de Pupilos</h1>
            <p className="text-gray-500 mt-1 text-sm">Cliques e visualizações por pupilo</p>
          </div>

          {/* Filtros */}
          <div className="border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
            {/* Período rápido */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Período</label>
              <select
                value={usandoCustomDate ? 'custom' : String(days)}
                onChange={e => {
                  if (e.target.value === 'custom') {
                    setUsandoCustomDate(true)
                  } else {
                    setUsandoCustomDate(false)
                    setDays(parseInt(e.target.value))
                  }
                }}
                className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Data personalizada</option>
              </select>
            </div>

            {usandoCustomDate && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">De</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Até</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black" />
                </div>
              </>
            )}

            {/* Filtro por pupilo */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Pupilo</label>
              <select
                value={pupiloFiltro}
                onChange={e => setPupiloFiltro(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black min-w-[200px]"
              >
                <option value="">Todos os pupilos</option>
                {todosOsPupilos.map(p => (
                  <option key={p.pupilo_id} value={p.pupilo_id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800"
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total de Cliques</p>
                  <p className="text-3xl font-bold text-black">{totalCliques.toLocaleString('pt-BR')}</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pupilos Visualizados</p>
                  <p className="text-3xl font-bold text-black">{ranking.length}</p>
                </div>
                {ranking[0] && (
                  <div className="border border-gray-200 p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mais Visto</p>
                    <p className="text-lg font-bold text-black truncate">{ranking[0].nome}</p>
                    <p className="text-sm text-gray-500">{ranking[0].total} cliques</p>
                  </div>
                )}
              </div>

              {/* Ranking geral ou detalhe de um pupilo */}
              {pupiloDetalhado ? (
                <div className="border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-black uppercase tracking-wide text-sm">
                      {pupiloDetalhado.nome} — {pupiloDetalhado.total} cliques no período
                    </h2>
                    <button onClick={() => setPupiloFiltro('')} className="text-xs text-gray-400 hover:text-black underline">
                      Ver todos
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliques</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pupiloDetalhado.por_dia.map((dia, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-3 text-sm text-gray-700">{formatDate(dia.data)}</td>
                            <td className="px-6 py-3 text-sm font-medium text-black">{dia.cliques}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-black uppercase tracking-wide text-sm">Ranking de Pupilos</h2>
                  </div>
                  {ranking.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-400 text-sm">Nenhum clique registrado neste período.</p>
                      <p className="text-gray-400 text-xs mt-1">Os cliques são registrados quando alguém abre a página de um pupilo.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pupilo</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total de Cliques</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalhar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ranking.map((p, i) => (
                            <tr key={p.pupilo_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-3 text-sm text-gray-400 font-medium">{i + 1}</td>
                              <td className="px-6 py-3 text-sm font-semibold text-black">{p.nome}</td>
                              <td className="px-6 py-3 text-sm text-black">{p.total.toLocaleString('pt-BR')}</td>
                              <td className="px-6 py-3">
                                <button
                                  onClick={() => setPupiloFiltro(p.pupilo_id)}
                                  className="text-xs text-gray-500 hover:text-black underline uppercase tracking-wide"
                                >
                                  Ver por dia
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
