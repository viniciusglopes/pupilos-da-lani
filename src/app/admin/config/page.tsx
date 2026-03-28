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
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [router])

  const saveConfig = () => {
    alert('Configuracoes salvas com sucesso!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm uppercase tracking-wide">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
              Configuracoes do Sistema
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Configure as opcoes gerais da plataforma
            </p>
          </div>

          <div className="space-y-8">
            {/* Configuracoes Gerais */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest">
                Informacoes Gerais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Nome do Site
                  </label>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Email de Contato
                  </label>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Descricao do Site
                  </label>
                  <textarea
                    value={config.siteDescription}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={config.contactPhone}
                    onChange={(e) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Limites de Arquivos */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest">
                Limites de Arquivos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Maximo de Fotos por Modelo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.maxPhotosPerModel}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxPhotosPerModel: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Maximo de Videos por Modelo
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={config.maxVideosPerModel}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxVideosPerModel: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Configuracoes de Comportamento */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest">
                Comportamento do Sistema
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificacoes por Email</h3>
                    <p className="text-sm text-gray-500">Receber emails sobre novos cadastros e atualizacoes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableNotifications}
                      onChange={(e) => setConfig(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Aprovacao Automatica</h3>
                    <p className="text-sm text-gray-500">Modelos ficam ativos automaticamente apos cadastro</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoApproveModels}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoApproveModels: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Informacoes do Sistema */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest">
                Informacoes do Sistema
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-black">v1.0.0</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Versao</div>
                </div>
                
                <div className="text-center p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-black">Online</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Status</div>
                </div>
                
                <div className="text-center p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-black">Supabase</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Banco de Dados</div>
                </div>
              </div>
            </div>

            {/* Botao de Salvar */}
            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium text-sm uppercase tracking-widest"
              >
                Salvar Configuracoes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
