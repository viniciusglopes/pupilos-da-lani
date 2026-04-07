'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface Secao {
  titulo: string
  texto: string
}

export default function AdminParceriaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [titulo, setTitulo] = useState('Pupilos Parceiros')
  const [subtitulo, setSubtitulo] = useState('Nossos pupilos em parceria exclusiva, prontos para seus projetos.')
  const [banner, setBanner] = useState('Pupilos em parceria exclusiva - disponibilidade garantida')
  const [semParceirosTitulo, setSemParceirosTitulo] = useState('Ainda não temos parceiros exclusivos')
  const [semParceirosTexto, setSemParceirosTexto] = useState('Em breve teremos nosso primeiro pupilo parceiro!')
  const [secoes, setSecoes] = useState<Secao[]>([])
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadContent()
  }, [router])

  const loadContent = async () => {
    try {
      const res = await fetch('/api/paginas?pagina=parceria')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.conteudo) {
          const c = data.conteudo
          setTitulo(c.titulo ?? '')
          setSubtitulo(c.subtitulo ?? '')
          if (c.conteudo) {
            setBanner(c.conteudo.banner ?? '')
            setSemParceirosTitulo(c.conteudo.sem_parceiros_titulo ?? '')
            setSemParceirosTexto(c.conteudo.sem_parceiros_texto ?? '')
            setSecoes(c.conteudo.secoes ?? [])
          }
        }
      }
    } catch (err) {
      console.error('Error loading:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/paginas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina: 'parceria',
          titulo,
          subtitulo,
          conteudo: {
            banner,
            sem_parceiros_titulo: semParceirosTitulo,
            sem_parceiros_texto: semParceirosTexto,
            secoes
          }
        })
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Conteudo salvo com sucesso!' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar' })
    } finally {
      setSaving(false)
    }
  }

  const addSecao = () => {
    setSecoes([...secoes, { titulo: '', texto: '' }])
  }

  const removeSecao = (index: number) => {
    setSecoes(secoes.filter((_, i) => i !== index))
  }

  const updateSecao = (index: number, field: 'titulo' | 'texto', value: string) => {
    setSecoes(secoes.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
              Editar Pagina de Parceria
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Altere os textos que aparecem na pagina de parceria
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 border ${
              message.type === 'success' ? 'border-gray-300 text-black' : 'border-gray-400 text-gray-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            {/* Main texts */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                Textos Principais
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Titulo da Pagina
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Subtitulo
                  </label>
                  <textarea
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Banner (texto de destaque)
                  </label>
                  <input
                    type="text"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Empty state texts */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                Quando Nao Ha Parceiros
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Titulo
                  </label>
                  <input
                    type="text"
                    value={semParceirosTitulo}
                    onChange={(e) => setSemParceirosTitulo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Texto
                  </label>
                  <textarea
                    value={semParceirosTexto}
                    onChange={(e) => setSemParceirosTexto(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic sections */}
            <div className="border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-black uppercase tracking-widest">
                  Secoes Adicionais ({secoes.length})
                </h2>
                <button
                  onClick={addSecao}
                  className="bg-black text-white px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                >
                  Adicionar Secao
                </button>
              </div>

              {secoes.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Nenhuma secao adicional. Clique em "Adicionar Secao" para criar.
                </p>
              ) : (
                <div className="space-y-6">
                  {secoes.map((secao, index) => (
                    <div key={index} className="border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Secao {index + 1}
                        </span>
                        <button
                          onClick={() => removeSecao(index)}
                          className="text-xs text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={secao.titulo}
                          onChange={(e) => updateSecao(index, 'titulo', e.target.value)}
                          placeholder="Titulo da secao"
                          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                        />
                        <textarea
                          value={secao.texto}
                          onChange={(e) => updateSecao(index, 'texto', e.target.value)}
                          placeholder="Texto da secao"
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Conteudo'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
