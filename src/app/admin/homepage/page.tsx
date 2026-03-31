'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [titulo, setTitulo] = useState('Pupilos da Lani')
  const [subtitulo, setSubtitulo] = useState('Conectando talentos com oportunidades.\nModelos profissionais em Minas Gerais.')
  const [btnTalentos, setBtnTalentos] = useState('Ver Talentos')
  const [btnModelo, setBtnModelo] = useState('Seja Modelo')
  const [destaquesLabel, setDestaquesLabel] = useState('Destaques')
  const [destaquesTitulo, setDestaquesTitulo] = useState('Modelos em Evidência')
  const [catalogoLabel, setCatalogoLabel] = useState('Nosso Catálogo')
  const [ctaTitulo, setCtaTitulo] = useState('Quer fazer parte?')
  const [ctaTexto, setCtaTexto] = useState('Cadastre-se como modelo e conecte-se com oportunidades profissionais.')
  const [ctaBotao, setCtaBotao] = useState('Cadastre-se')
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) { router.push('/login'); return }
    loadContent()
  }, [router])

  const loadContent = async () => {
    try {
      const res = await fetch('/api/paginas?pagina=home')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.conteudo) {
          const c = data.conteudo
          setTitulo(c.titulo ?? 'Pupilos da Lani')
          setSubtitulo(c.subtitulo ?? '')
          if (c.conteudo) {
            setBtnTalentos(c.conteudo.btn_talentos ?? 'Ver Talentos')
            setBtnModelo(c.conteudo.btn_modelo ?? 'Seja Pupilo')
            setDestaquesLabel(c.conteudo.destaques_label ?? 'Destaques')
            setDestaquesTitulo(c.conteudo.destaques_titulo ?? 'Pupilos em Evidência')
            setCatalogoLabel(c.conteudo.catalogo_label ?? 'Nosso Catálogo')
            setCtaTitulo(c.conteudo.cta_titulo ?? 'Quer fazer parte?')
            setCtaTexto(c.conteudo.cta_texto ?? '')
            setCtaBotao(c.conteudo.cta_botao ?? 'Cadastre-se')
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
          pagina: 'home',
          titulo,
          subtitulo,
          conteudo: {
            btn_talentos: btnTalentos,
            btn_modelo: btnModelo,
            destaques_label: destaquesLabel,
            destaques_titulo: destaquesTitulo,
            catalogo_label: catalogoLabel,
            cta_titulo: ctaTitulo,
            cta_texto: ctaTexto,
            cta_botao: ctaBotao
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
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
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
              Editar Pagina Principal
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Altere os textos que aparecem na homepage
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
            {/* Hero */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                Hero (Topo da Pagina)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Titulo Principal</label>
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Subtitulo</label>
                  <textarea value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} rows={3}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Botao Esquerdo</label>
                    <input type="text" value={btnTalentos} onChange={(e) => setBtnTalentos(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Botao Direito</label>
                    <input type="text" value={btnModelo} onChange={(e) => setBtnModelo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                Secoes do Catalogo
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Label Destaques</label>
                    <input type="text" value={destaquesLabel} onChange={(e) => setDestaquesLabel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Titulo Destaques</label>
                    <input type="text" value={destaquesTitulo} onChange={(e) => setDestaquesTitulo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Label Catalogo</label>
                  <input type="text" value={catalogoLabel} onChange={(e) => setCatalogoLabel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-black mb-6 uppercase tracking-widest">
                CTA (Chamada Final)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Titulo</label>
                  <input type="text" value={ctaTitulo} onChange={(e) => setCtaTitulo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Texto</label>
                  <textarea value={ctaTexto} onChange={(e) => setCtaTexto(e.target.value)} rows={2}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">Texto do Botao</label>
                  <input type="text" value={ctaBotao} onChange={(e) => setCtaBotao(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="bg-black text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Conteudo'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
