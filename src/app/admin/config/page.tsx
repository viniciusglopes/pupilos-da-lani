'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface MenuItem {
  label: string
  href: string
}

interface SiteConfig {
  logo_url: string
  logo_texto: string
  menu_items: MenuItem[]
}

const DEFAULT: SiteConfig = {
  logo_url: '',
  logo_texto: 'Pupilos da Lani',
  menu_items: [
    { label: 'Início', href: '/' },
    { label: 'Talentos', href: '/busca' },
  ]
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
      const res = await fetch('/api/config/site')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.config) {
          setConfig({ ...DEFAULT, ...data.config })
        }
      }
    } catch {}
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/config/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      } else {
        throw new Error(data.error || 'Erro ao salvar')
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar' })
    } finally {
      setSaving(false)
    }
  }

  const updateMenuItem = (index: number, field: 'label' | 'href', value: string) => {
    setConfig(prev => ({
      ...prev,
      menu_items: prev.menu_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
              Configurar Header / Menu
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Logo, nome do site e textos do menu de navegação
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 border ${
              message.type === 'success' ? 'border-gray-300 text-black' : 'border-red-300 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Logo */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                Logo / Nome do Site
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Texto do Logo
                  </label>
                  <input
                    type="text"
                    value={config.logo_texto}
                    onChange={e => setConfig(prev => ({ ...prev, logo_texto: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="Pupilos da Lani"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Exibido quando não há logo em imagem
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    URL da Logo (imagem)
                  </label>
                  <input
                    type="url"
                    value={config.logo_url}
                    onChange={e => setConfig(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="https://... (deixe em branco para usar texto)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Se preenchido, exibe a imagem no lugar do texto
                  </p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Preview:</p>
                  {config.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.logo_url} alt="Logo preview" className="h-10 w-auto object-contain" />
                  ) : (
                    <span className="text-xl font-bold tracking-tight text-black uppercase">
                      {config.logo_texto || 'Pupilos da Lani'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                Itens do Menu
              </h2>

              <div className="space-y-4">
                {config.menu_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-100">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        Texto exibido
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updateMenuItem(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                      />
                    </div>
                    <div className="w-40">
                      <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        Link (rota)
                      </label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={e => updateMenuItem(index, 'href', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  O item "Admin" é fixo e não aparece aqui.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
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
