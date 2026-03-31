'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface CamposVisibilidade {
  mostrar_altura: boolean
  mostrar_medidas: boolean
  mostrar_olhos: boolean
  mostrar_cabelo: boolean
  mostrar_localizacao: boolean
  mostrar_especializacoes: boolean
  mostrar_descricao: boolean
  mostrar_contatos: boolean
}

export default function AdminCamposVisibilidadePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [campos, setCampos] = useState<CamposVisibilidade>({
    mostrar_altura: true,
    mostrar_medidas: true,
    mostrar_olhos: true,
    mostrar_cabelo: true,
    mostrar_localizacao: true,
    mostrar_especializacoes: true,
    mostrar_descricao: true,
    mostrar_contatos: true
  })
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadCampos()
  }, [router])

  const loadCampos = async () => {
    try {
      const res = await fetch('/api/config/campos-visibilidade')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCampos(data.campos)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (campo: keyof CamposVisibilidade) => {
    setCampos(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/config/campos-visibilidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campos })
      })

      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      } else {
        throw new Error(data.error || 'Erro ao salvar')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const campoLabels = {
    mostrar_altura: {
      title: 'Altura',
      description: 'Exibir altura do pupilo (em centímetros)'
    },
    mostrar_medidas: {
      title: 'Medidas Corporais',
      description: 'Exibir busto, cintura e quadril'
    },
    mostrar_olhos: {
      title: 'Cor dos Olhos',
      description: 'Exibir cor dos olhos'
    },
    mostrar_cabelo: {
      title: 'Cor do Cabelo',
      description: 'Exibir cor do cabelo'
    },
    mostrar_localizacao: {
      title: 'Localização',
      description: 'Exibir cidade/região'
    },
    mostrar_especializacoes: {
      title: 'Especialidades',
      description: 'Exibir tags de especialidades'
    },
    mostrar_descricao: {
      title: 'Descrição Pessoal',
      description: 'Exibir texto sobre o pupilo'
    },
    mostrar_contatos: {
      title: 'Botões de Contato',
      description: 'Exibir WhatsApp, Instagram e Email'
    }
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
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide mb-2">
              Campos da Página do Pupilo
            </h1>
            <p className="text-gray-600 text-sm">
              Configure quais informações são exibidas na página individual de cada pupilo
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 mb-6 border ${
              message.type === 'success' 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white border border-gray-200 p-8">
            <div className="space-y-8">
              {/* Características Físicas */}
              <div>
                <h3 className="text-lg font-semibold text-black uppercase tracking-wide mb-4">
                  Características Físicas
                </h3>
                <div className="space-y-4">
                  {(['mostrar_altura', 'mostrar_medidas', 'mostrar_olhos', 'mostrar_cabelo'] as const).map((campo) => (
                    <label key={campo} className="flex items-start space-x-3 p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={campos[campo]}
                        onChange={() => handleToggle(campo)}
                        className="mt-1 h-4 w-4 text-black border-gray-300 focus:ring-black"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{campoLabels[campo].title}</div>
                        <div className="text-sm text-gray-500">{campoLabels[campo].description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Localização e Especialidades */}
              <div>
                <h3 className="text-lg font-semibold text-black uppercase tracking-wide mb-4">
                  Localização e Especialidades
                </h3>
                <div className="space-y-4">
                  {(['mostrar_localizacao', 'mostrar_especializacoes'] as const).map((campo) => (
                    <label key={campo} className="flex items-start space-x-3 p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={campos[campo]}
                        onChange={() => handleToggle(campo)}
                        className="mt-1 h-4 w-4 text-black border-gray-300 focus:ring-black"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{campoLabels[campo].title}</div>
                        <div className="text-sm text-gray-500">{campoLabels[campo].description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Informações Pessoais e Contato */}
              <div>
                <h3 className="text-lg font-semibold text-black uppercase tracking-wide mb-4">
                  Informações Pessoais e Contato
                </h3>
                <div className="space-y-4">
                  {(['mostrar_descricao', 'mostrar_contatos'] as const).map((campo) => (
                    <label key={campo} className="flex items-start space-x-3 p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={campos[campo]}
                        onChange={() => handleToggle(campo)}
                        className="mt-1 h-4 w-4 text-black border-gray-300 focus:ring-black"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{campoLabels[campo].title}</div>
                        <div className="text-sm text-gray-500">{campoLabels[campo].description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-8 p-4 bg-gray-50 border-l-4 border-black">
              <h4 className="font-medium text-gray-900 mb-2">Preview das alterações:</h4>
              <p className="text-sm text-gray-600">
                As configurações se aplicam à página individual de cada pupilo (/pupilos/[id]). 
                Campos desabilitados não aparecerão para os visitantes do site.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}