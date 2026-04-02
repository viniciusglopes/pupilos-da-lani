'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface HomepageConfig {
  mostrar_titulo: boolean
  mostrar_destaques: boolean
}

export default function AdminHomepageConfigPage() {
  const [config, setConfig] = useState<HomepageConfig>({
    mostrar_titulo: true,
    mostrar_destaques: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadConfig()
  }, [router])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config/homepage')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConfig(data.config)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/config/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar configuração')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Erro na resposta da API')
      }

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })

      // Update config with saved data
      setConfig(result.config)

    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof HomepageConfig) => {
    setConfig(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm uppercase tracking-wide">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Controle Seções Homepage</h1>
              <p className="text-gray-600 mt-1">Ligar/desligar seções da página inicial</p>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 border ${
              message.type === 'success' 
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-red-300 bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white border border-gray-200 p-8">
            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-black mb-6 uppercase tracking-widest">
                  Controles das Seções
                </h2>
                
                <div className="space-y-6">
                  {/* Título */}
                  <div className="flex items-center justify-between p-6 border-2 border-gray-200 bg-blue-50">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-3">
                        📄 Título + Subtítulo
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Seção com título principal e subtítulo da homepage.
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Quando ligado:</strong> "PUPILOS DA LANI" + descrição aparecem<br/>
                        <strong>Quando desligado:</strong> Página começa direto nas próximas seções
                      </p>
                    </div>
                    <div className="ml-8">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.mostrar_titulo}
                          onChange={() => handleToggle('mostrar_titulo')}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Destaques */}
                  <div className="flex items-center justify-between p-6 border-2 border-gray-200 bg-green-50">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-3">
                        🌟 Seção Destaques
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Carrossel com pupilos marcados como "destaque".
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Quando ligado:</strong> Carrossel aparece após título<br/>
                        <strong>Quando desligado:</strong> Catálogo fica mais próximo do topo
                      </p>
                    </div>
                    <div className="ml-8">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.mostrar_destaques}
                          onChange={() => handleToggle('mostrar_destaques')}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Status */}
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest">
                  Estrutura da Homepage
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border-l-4 border-gray-400">
                    <span className="text-gray-600">1. Header</span>
                    <span className="text-gray-400 text-xs">• Sempre visível</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 border-l-4 ${config.mostrar_titulo ? 'bg-blue-50 border-blue-500' : 'bg-red-50 border-red-400'}`}>
                    <span className="text-gray-600">2. Título + Subtítulo</span>
                    <span className={`text-xs font-medium ${config.mostrar_titulo ? 'text-blue-600' : 'text-red-600'}`}>
                      {config.mostrar_titulo ? '• Visível' : '• Oculta'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 border-l-4 ${config.mostrar_destaques ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-400'}`}>
                    <span className="text-gray-600">3. Seção Destaques</span>
                    <span className={`text-xs font-medium ${config.mostrar_destaques ? 'text-green-600' : 'text-red-600'}`}>
                      {config.mostrar_destaques ? '• Visível' : '• Oculta'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-500">
                    <span className="text-gray-600">4. Seção Catálogo</span>
                    <span className="text-yellow-600 text-xs font-medium">
                      • Sempre visível 
                      {!config.mostrar_titulo && !config.mostrar_destaques && ' (início da página)'}
                      {!config.mostrar_titulo && config.mostrar_destaques && ' (após destaques)'}
                      {config.mostrar_titulo && !config.mostrar_destaques && ' (após título)'}
                      {config.mostrar_titulo && config.mostrar_destaques && ' (após destaques)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border-l-4 border-gray-400">
                    <span className="text-gray-600">5. Footer</span>
                    <span className="text-gray-400 text-xs">• Sempre visível</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-white py-3 px-6 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm font-semibold"
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
                
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-colors text-sm font-semibold uppercase tracking-widest"
                >
                  👁️ Visualizar Site
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}