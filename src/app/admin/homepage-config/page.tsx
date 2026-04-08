'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'

export default function AdminHomepageConfigPage() {
  const [config, setConfig] = useState({ mostrar_titulo: true, mostrar_destaques: true })
  const [texts, setTexts] = useState({
    titulo: '',
    subtitulo: '',
    destaques_label: '',
    destaques_titulo: '',
  })
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingTexts, setSavingTexts] = useState(false)
  const [msgConfig, setMsgConfig] = useState<{ ok: boolean; text: string } | null>(null)
  const [msgTexts, setMsgTexts] = useState<{ ok: boolean; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/login'); return }
    loadAll()
  }, [router])

  const loadAll = async () => {
    try {
      // Leitura direto do Supabase (sem cache de proxy)
      const [{ data: cfgData }, { data: txtData }] = await Promise.all([
        supabase.from('homepage_config').select('mostrar_titulo, mostrar_destaques').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('paginas_conteudo').select('titulo, subtitulo, conteudo').eq('pagina', 'home').maybeSingle(),
      ])
      if (cfgData) setConfig({ mostrar_titulo: cfgData.mostrar_titulo, mostrar_destaques: cfgData.mostrar_destaques })
      if (txtData) {
        setTexts({
          titulo: txtData.titulo ?? '',
          subtitulo: txtData.subtitulo ?? '',
          destaques_label: txtData.conteudo?.destaques_label ?? '',
          destaques_titulo: txtData.conteudo?.destaques_titulo ?? '',
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSavingConfig(true)
    setMsgConfig(null)
    try {
      const res = await fetch('/api/config/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error || 'Erro ao salvar')
      setMsgConfig({ ok: true, text: 'Configurações salvas!' })
    } catch (e: any) {
      setMsgConfig({ ok: false, text: e.message })
    } finally {
      setSavingConfig(false)
    }
  }

  const saveTexts = async () => {
    setSavingTexts(true)
    setMsgTexts(null)
    try {
      // Buscar conteudo atual para preservar outros campos
      const { data: current } = await supabase.from('paginas_conteudo').select('conteudo').eq('pagina', 'home').maybeSingle()
      const currentConteudo = current?.conteudo || {}

      const body = {
        pagina: 'home',
        titulo: texts.titulo,
        subtitulo: texts.subtitulo,
        conteudo: {
          ...currentConteudo,
          destaques_label: texts.destaques_label,
          destaques_titulo: texts.destaques_titulo,
        },
      }
      const saveRes = await fetch('/api/paginas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await saveRes.json()
      if (!saveRes.ok || !d.success) throw new Error(d.error || 'Erro ao salvar')
      setMsgTexts({ ok: true, text: 'Textos salvos!' })
    } catch (e: any) {
      setMsgTexts({ ok: false, text: e.message })
    } finally {
      setSavingTexts(false)
    }
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
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-8">

          <div>
            <h1 className="text-xl font-bold text-black uppercase tracking-wide">Configurar Homepage</h1>
            <p className="text-gray-400 text-sm mt-0.5">Controle de seções e textos da página principal</p>
          </div>

          {/* Seção: Toggles */}
          <div className="border border-gray-200 p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Exibição das Seções</h2>
            <div className="space-y-3">
              {([
                { key: 'mostrar_titulo', label: 'Título + Subtítulo', desc: 'Exibe o título e subtítulo no topo da página' },
                { key: 'mostrar_destaques', label: 'Seção Destaques', desc: 'Exibe o carrossel de pupilos em destaque' },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-black">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config[key] ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            {msgConfig && (
              <p className={`mt-3 text-xs ${msgConfig.ok ? 'text-green-600' : 'text-red-500'}`}>{msgConfig.text}</p>
            )}
            <button onClick={saveConfig} disabled={savingConfig}
              className="mt-4 w-full bg-black text-white py-2 text-sm uppercase tracking-wide hover:bg-gray-800 disabled:opacity-50">
              {savingConfig ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>

          {/* Seção: Textos */}
          <div className="border border-gray-200 p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Editar Textos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Título principal</label>
                <input type="text" value={texts.titulo}
                  onChange={e => setTexts(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Subtítulo</label>
                <textarea value={texts.subtitulo}
                  onChange={e => setTexts(p => ({ ...p, subtitulo: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Label da seção Destaques</label>
                <input type="text" value={texts.destaques_label}
                  onChange={e => setTexts(p => ({ ...p, destaques_label: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="Ex: Destaques" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Título da seção Destaques</label>
                <input type="text" value={texts.destaques_titulo}
                  onChange={e => setTexts(p => ({ ...p, destaques_titulo: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="Ex: Pupilos em Evidência" />
              </div>
            </div>
            {msgTexts && (
              <p className={`mt-3 text-xs ${msgTexts.ok ? 'text-green-600' : 'text-red-500'}`}>{msgTexts.text}</p>
            )}
            <button onClick={saveTexts} disabled={savingTexts}
              className="mt-4 w-full bg-black text-white py-2 text-sm uppercase tracking-wide hover:bg-gray-800 disabled:opacity-50">
              {savingTexts ? 'Salvando...' : 'Salvar Textos'}
            </button>
          </div>

          <a href="/" target="_blank" rel="noopener noreferrer"
            className="block text-center border border-gray-300 py-2 text-sm text-gray-600 hover:border-black hover:text-black transition-colors uppercase tracking-wide">
            Ver página principal →
          </a>

        </div>
      </main>
    </div>
  )
}
