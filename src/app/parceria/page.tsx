'use client'

import { useState, useEffect } from 'react'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface ParceriaContent {
  titulo: string
  subtitulo: string
  conteudo: {
    banner: string
    sem_parceiros_titulo: string
    sem_parceiros_texto: string
    secoes: { titulo: string; texto: string }[]
  }
}

const DEFAULTS: ParceriaContent = {
  titulo: 'Pupilos Parceiros',
  subtitulo: 'Nossos pupilos em parceria exclusiva, prontos para seus projetos.',
  conteudo: {
    banner: 'Pupilos em parceria exclusiva - disponibilidade garantida',
    sem_parceiros_titulo: 'Ainda não temos parceiros exclusivos',
    sem_parceiros_texto: 'Em breve teremos nosso primeiro pupilo parceiro!',
    secoes: []
  }
}

export default function ParceriaPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [content, setContent] = useState<ParceriaContent>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load content
      const contentRes = await fetch('/api/paginas?pagina=parceria')
      if (contentRes.ok) {
        const contentData = await contentRes.json()
        if (contentData.success && contentData.conteudo) {
          setContent({
            titulo: contentData.conteudo.titulo ?? DEFAULTS.titulo,
            subtitulo: contentData.conteudo.subtitulo ?? DEFAULTS.subtitulo,
            conteudo: { ...DEFAULTS.conteudo, ...contentData.conteudo.conteudo }
          })
        }
      }

      // Load models
      const res = await fetch('/api/modelos')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const parceiros = data.modelos
            .filter((m: any) => m.parceria && m.ativo)
            .map((m: any) => ({ ...m, fotos: m.fotos || [], videos: m.videos || [] }))
          setPessoas(parceiros)
        }
      }
    } catch (err) {
      console.error('Error loading:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black uppercase tracking-wide">
            {content.titulo}
          </h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto mt-4">
            {content.subtitulo}
          </p>
        </div>

        {/* Dynamic sections */}
        {content.conteudo.secoes && content.conteudo.secoes.length > 0 && (
          <div className="mb-16 space-y-8">
            {content.conteudo.secoes.map((secao, index) => (
              <div key={index} className="border-l-2 border-black pl-6">
                <h3 className="text-lg font-bold text-black uppercase tracking-wide">{secao.titulo}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{secao.texto}</p>
              </div>
            ))}
          </div>
        )}

        {pessoas.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {content.conteudo.sem_parceiros_titulo}
            </h2>
            <p className="text-gray-500 mb-6">
              {content.conteudo.sem_parceiros_texto}
            </p>
            <Link
              href="/"
              className="text-xs text-black font-semibold uppercase tracking-widest underline"
            >
              Ver todos os pupilos disponiveis
            </Link>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 p-4 mb-10">
              <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                {content.conteudo.banner}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2">
              {pessoas.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} isParceiro={true} source="parceria" />
              ))}
            </div>
          </>
        )}

      </main>

      <Footer />
    </div>
  )
}
