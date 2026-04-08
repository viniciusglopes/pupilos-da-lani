'use client'

import { useState, useEffect } from 'react'
import { PessoaCompleta } from '@/types/database'
import ModelCardSimpleFixed from '@/components/ModelCardSimpleFixed'
import FeaturedPupilosCarousel from '@/components/FeaturedPupilosCarousel'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

// NOTA: Configurações anti-cache removidas (incompatíveis com 'use client')
// Client Components controlam cache via fetch() headers

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface HomeContent {
  titulo: string
  subtitulo: string
  conteudo: {
    btn_talentos: string
    btn_modelo: string
    destaques_label: string
    destaques_titulo: string
    catalogo_label: string
    cta_titulo: string
    cta_texto: string
    cta_botao: string
  }
}

const DEFAULTS: HomeContent = {
  titulo: 'Pupilos da Lani',
  subtitulo: 'Conectando talentos com oportunidades.\nPupilos profissionais em Minas Gerais.',
  conteudo: {
    btn_talentos: 'Ver Talentos',
    btn_modelo: 'Seja Pupilo',
    destaques_label: 'Destaques',
    destaques_titulo: 'Pupilos em Evidência',
    catalogo_label: 'Nosso Catálogo',
    cta_titulo: 'Quer fazer parte?',
    cta_texto: 'Cadastre-se como pupilo e conecte-se com oportunidades profissionais.',
    cta_botao: 'Cadastre-se'
  }
}

interface HomepageConfig {
  mostrar_titulo: boolean
  mostrar_destaques: boolean
}

const PAGE_SIZE = 12

export default function HomePage() {
  const [todos, setTodos] = useState<PessoaCompleta[]>([])
  const [destaques, setDestaques] = useState<PessoaCompleta[]>([])
  const [outros, setOutros] = useState<PessoaCompleta[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [content, setContent] = useState<HomeContent>(DEFAULTS)
  const [config, setConfig] = useState<HomepageConfig>({
    mostrar_titulo: true,
    mostrar_destaques: true
  })
  const [loading, setLoading] = useState(true)
  const [timestamp] = useState(Date.now()) // Cache bust timestamp

  useEffect(() => {
    loadData()
    
    // Track page visit - TEMPORARIAMENTE DESABILITADO
    // fetch('/api/analytics/visit', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     page_path: '/',
    //     referrer: document.referrer
    //   }),
    // }).catch(err => console.warn('Analytics tracking failed:', err))
  }, [])

  const loadData = async () => {
    try {
      const cacheBust = Date.now()
      
      // Load homepage config first
      const configRes = await fetch(`/api/config/homepage?t=${cacheBust}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
      if (configRes.ok) {
        const configData = await configRes.json()
        // console.log('⚙️ Config carregado:', configData.config)
        if (configData.success && configData.config) {
          setConfig(configData.config)
        }
      }
      
      // Load content with cache bust
      const contentRes = await fetch(`/api/paginas?pagina=home&t=${cacheBust}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
      if (contentRes.ok) {
        const contentData = await contentRes.json()
        // console.log('📄 Content carregado:', contentData.conteudo?.titulo)
        if (contentData.success && contentData.conteudo) {
          const c = contentData.conteudo
          setContent({
            titulo: c.titulo ?? DEFAULTS.titulo,
            subtitulo: c.subtitulo ?? DEFAULTS.subtitulo,
            conteudo: { ...DEFAULTS.conteudo, ...c.conteudo }
          })
        }
      }

      // Load models with cache bust
      const res = await fetch(`/api/modelos?t=${cacheBust}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
      if (res.ok) {
        const data = await res.json()
        // console.log('👥 Models carregados:', data.modelos?.length)
        if (data.success) {
          const all = data.modelos
            .filter((m: any) => m.ativo)
            .map((m: any) => ({ ...m, fotos: m.fotos || [], videos: m.videos || [] })) as PessoaCompleta[]
          setTodos(all)
          setDestaques(shuffle(all.filter(p => p.destaque))) // Show ALL destaques, not just 4
          setOutros(shuffle(all.filter(p => !p.destaque)))
        }
      }
    } catch (err) {
      // console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const heroModel = destaques.find(d => d.fotos.length > 0)
  const titleParts = content.titulo.split(/\s+/)
  const titleLine1 = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(' ')
  const titleLine2 = titleParts.slice(Math.ceil(titleParts.length / 2)).join(' ')

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      {/* Título - controlável via admin/homepage-config */}
      {config.mostrar_titulo && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black uppercase leading-tight">
            {content.titulo}
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed whitespace-pre-line max-w-xl">
            {content.subtitulo}
          </p>
        </section>
      )}

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 ${!config.mostrar_titulo ? 'pt-10 sm:pt-16' : ''}`}>
        {/* Featured Pupilos Carousel - controlável via admin/homepage-config */}
        {config.mostrar_destaques && destaques.length > 0 && (
          <FeaturedPupilosCarousel
            pupilos={destaques}
            title={content.conteudo.destaques_label}
            subtitle={content.conteudo.destaques_titulo}
          />
        )}

        {/* Catalogo */}
        <section className="mt-0">
          {todos.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-sm tracking-widest uppercase">
                Nenhum pupilo cadastrado
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 items-start [&>*]:min-w-0">
                {todos.slice(0, visibleCount).map((pessoa) => (
                  <ModelCardSimpleFixed key={pessoa.id} pessoa={pessoa} />
                ))}
              </div>

              {visibleCount < todos.length && (
                <div className="text-center mt-8 sm:mt-12">
                  <button
                    onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                    className="border border-black text-black font-semibold px-8 sm:px-10 py-3 hover:bg-black hover:text-white transition-all uppercase tracking-widest text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Ver Mais Pupilos
                  </button>
                  <p className="text-xs text-gray-400 mt-3">
                    Exibindo {Math.min(visibleCount, todos.length)} de {todos.length}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}