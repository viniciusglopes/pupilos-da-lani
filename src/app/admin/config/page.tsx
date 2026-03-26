'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function ConfigPage() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState({
    siteName: 'Pupilos da Lani',
    siteDescription: 'Portal de modelos profissionais em Minas Gerais',
    contactEmail: 'contato@pupiloslani.com.br',
    contactPhone: '(31) 9 9999-9999',
    maxPhotosPerModel: 10,
    maxVideosPerModel: 3,
    enableNotifications: true,
    autoApproveModels: false
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Simular carregamento
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [router])

  const saveConfig = () => {
    // Aqui você implementaria o salvamento real no banco
    alert('Configurações salvas com sucesso!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações do Sistema
            </h1>
            <p className="text-gray-600 mt-2">
              Configure as opções gerais da plataforma
            </p>
          </div>

          <div className="space-y-8">
            {/* Configurações Gerais */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📝 Informações Gerais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Site
                  </label>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contato
                  </label>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Site
                  </label>
                  <textarea
                    value={config.siteDescription}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={config.contactPhone}
                    onChange={(e) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Limites de Arquivos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Limites de Arquivos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Fotos por Modelo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.maxPhotosPerModel}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxPhotosPerModel: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Vídeos por Modelo
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={config.maxVideosPerModel}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxVideosPerModel: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Configurações de Comportamento */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ⚙️ Comportamento do Sistema
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificações por Email</h3>
                    <p className="text-sm text-gray-600">Receber emails sobre novos cadastros e atualizações</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableNotifications}
                      onChange={(e) => setConfig(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Aprovação Automática</h3>
                    <p className="text-sm text-gray-600">Modelos ficam ativos automaticamente após cadastro</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoApproveModels}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoApproveModels: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ℹ️ Informações do Sistema
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">v1.0.0</div>
                  <div className="text-sm text-gray-600">Versão do Sistema</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Supabase</div>
                  <div className="text-sm text-gray-600">Banco de Dados</div>
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                💾 Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}