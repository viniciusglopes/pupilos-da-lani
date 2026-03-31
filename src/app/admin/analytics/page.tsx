'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface ClickStats {
  pupilo_id: string
  nome: string
  total_clicks: number
}

interface VisitStats {
  date: string
  total_visits: number
  unique_visitors: number
  unique_pages: number
}

export default function AdminAnalyticsPage() {
  const [clickStats, setClickStats] = useState<ClickStats[]>([])
  const [visitStats, setVisitStats] = useState<VisitStats[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30) // days

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load click stats (would need a new API endpoint)
      // For now, let's load visit stats
      const visitRes = await fetch(`/api/analytics/visit?days=${timeRange}`)
      if (visitRes.ok) {
        const visitData = await visitRes.json()
        if (visitData.success) {
          setVisitStats(visitData.data.daily_summary || [])
        }
      }

      // TODO: Load top clicked pupilos
      // This would require a new API endpoint to call the SQL function we created
      
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalVisits = visitStats.reduce((sum, day) => sum + day.total_visits, 0)
  const totalUniqueVisitors = visitStats.reduce((sum, day) => sum + day.unique_visitors, 0)
  const avgDailyVisits = visitStats.length > 0 ? (totalVisits / visitStats.length).toFixed(1) : '0'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Analytics</h1>
              <p className="text-gray-600 mt-1">Estatísticas de uso da plataforma</p>
            </div>
            
            <div>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Summary Cards */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Total de Visitas
                </h3>
                <p className="text-3xl font-bold text-black">{totalVisits.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Últimos {timeRange} dias</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Visitantes Únicos
                </h3>
                <p className="text-3xl font-bold text-black">{totalUniqueVisitors.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Total estimado</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Média Diária
                </h3>
                <p className="text-3xl font-bold text-black">{avgDailyVisits}</p>
                <p className="text-sm text-gray-500 mt-1">Visitas por dia</p>
              </div>

              {/* Visit Stats Table */}
              <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Estatísticas Diárias</h3>
                </div>
                
                {visitStats.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-400">Nenhum dado de visita encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Visitas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Visitantes Únicos
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Páginas Únicas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {visitStats.slice(0, 20).map((stat, index) => (
                          <tr key={stat.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(stat.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                              {stat.total_visits}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {stat.unique_visitors}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {stat.unique_pages}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Placeholder for Click Stats */}
              <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Pupilos Mais Clicados</h3>
                </div>
                
                <div className="p-12 text-center">
                  <p className="text-gray-400">
                    Estatísticas de cliques em desenvolvimento
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Esta funcionalidade será implementada em breve
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}