'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface DebugInfo {
  timestamp: number
  page: string
  content: any
  modelos: any[]
  performance: {
    contentLoadTime?: number
    modelosLoadTime?: number
  }
  errors: string[]
}

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    timestamp: Date.now(),
    page: 'Admin Debug',
    content: null,
    modelos: [],
    performance: {},
    errors: []
  })
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    collectDebugInfo()
  }, [refreshCount])

  const collectDebugInfo = async () => {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      // Test Content API
      const contentStart = Date.now()
      try {
        const contentRes = await fetch(`/api/paginas?pagina=home&t=${Date.now()}`)
        const contentData = await contentRes.json()
        setDebugInfo(prev => ({ 
          ...prev, 
          content: contentData,
          performance: { ...prev.performance, contentLoadTime: Date.now() - contentStart }
        }))
      } catch (err: any) {
        errors.push(`Content API: ${err.message}`)
      }

      // Test Models API
      const modelosStart = Date.now()
      try {
        const modelosRes = await fetch(`/api/modelos?t=${Date.now()}`)
        const modelosData = await modelosRes.json()
        setDebugInfo(prev => ({ 
          ...prev, 
          modelos: modelosData.modelos || [],
          performance: { ...prev.performance, modelosLoadTime: Date.now() - modelosStart }
        }))
      } catch (err: any) {
        errors.push(`Models API: ${err.message}`)
      }

      setDebugInfo(prev => ({ ...prev, errors, timestamp: startTime }))

    } catch (err: any) {
      errors.push(`General: ${err.message}`)
      setDebugInfo(prev => ({ ...prev, errors }))
    }
  }

  const refresh = () => {
    setRefreshCount(prev => prev + 1)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Debug Portal</h1>
              <p className="text-gray-600 mt-1">Informações técnicas do sistema</p>
            </div>
            <button
              onClick={refresh}
              className="bg-black text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
            >
              🔄 Atualizar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Info */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-widest">
                Sistema
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Última Atualização</span>
                  <span className="font-medium">{formatDate(debugInfo.timestamp)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Timestamp Unix</span>
                  <span className="font-medium">{debugInfo.timestamp}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Pupilos Carregados</span>
                  <span className="font-medium">{debugInfo.modelos.length}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Destaques</span>
                  <span className="font-medium">
                    {debugInfo.modelos.filter(m => m.destaque).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-widest">
                Performance
              </h2>
              <div className="space-y-3 text-sm">
                {debugInfo.performance.contentLoadTime && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">API Conteúdo</span>
                    <span className={`font-medium ${debugInfo.performance.contentLoadTime > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                      {debugInfo.performance.contentLoadTime}ms
                    </span>
                  </div>
                )}
                {debugInfo.performance.modelosLoadTime && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">API Modelos</span>
                    <span className={`font-medium ${debugInfo.performance.modelosLoadTime > 2000 ? 'text-red-600' : 'text-green-600'}`}>
                      {debugInfo.performance.modelosLoadTime}ms
                    </span>
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Status</div>
                  {debugInfo.errors.length === 0 ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 text-sm">
                      ✅ Sistema OK
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 text-sm">
                      ⚠️ {debugInfo.errors.length} erro(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Debug */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-widest">
                Conteúdo Homepage
              </h2>
              {debugInfo.content ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Título</span>
                    <span className="font-medium">
                      {debugInfo.content.conteudo?.titulo || 'Padrão'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">API Status</span>
                    <span className="font-medium text-green-600">
                      {debugInfo.content.success ? 'Sucesso' : 'Erro'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 uppercase tracking-widest">
                        Raw Data
                      </summary>
                      <pre className="mt-2 bg-gray-50 p-2 overflow-auto max-h-32 text-xs">
                        {JSON.stringify(debugInfo.content, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Carregando...</p>
              )}
            </div>

            {/* Errors */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-widest">
                Erros
              </h2>
              {debugInfo.errors.length === 0 ? (
                <p className="text-green-600 text-sm">✅ Nenhum erro detectado</p>
              ) : (
                <div className="space-y-2">
                  {debugInfo.errors.map((error, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 p-3 text-sm">
                      <span className="text-red-800">{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-widest">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/"
                target="_blank"
                className="block text-center bg-gray-50 hover:bg-gray-100 p-4 transition-colors text-sm"
              >
                🏠 Homepage
              </a>
              <a
                href="/pupilos"
                target="_blank"
                className="block text-center bg-gray-50 hover:bg-gray-100 p-4 transition-colors text-sm"
              >
                👥 Pupilos
              </a>
              <a
                href="/api/modelos"
                target="_blank"
                className="block text-center bg-gray-50 hover:bg-gray-100 p-4 transition-colors text-sm"
              >
                🔗 API Modelos
              </a>
              <a
                href="/api/footer"
                target="_blank"
                className="block text-center bg-gray-50 hover:bg-gray-100 p-4 transition-colors text-sm"
              >
                🦶 API Footer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}