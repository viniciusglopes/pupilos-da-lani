'use client'

import { useState, useEffect } from 'react'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

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
  subtitulo: 'Conectando talentos com oportunidades.\nModelos profissionais em Minas Gerais.',
  conteudo: {
    btn_talentos: 'Ver Talentos',
    btn_modelo: 'Seja Modelo',
    destaques_label: 'Destaques',
    destaques_titulo: 'Modelos em Evidência',
    catalogo_label: 'Nosso Catálogo',
    cta_titulo: 'Quer fazer parte?',
    cta_texto: 'Cadastre-se como modelo e conecte-se com oportunidades profissionais.',
    cta_botao: 'Cadastre-se'
  }
}

export default function HomePage() {
  const [todos, setTodos] = useState<PessoaCompleta[]>([])
  const [destaques, setDestaques] = useState<PessoaCompleta[]>([])
  const [outros, setOutros] = useState<PessoaCompleta[]>([])
  const [content, setContent] = useState<HomeContent>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load content
      const contentRes = await fetch('/api/paginas?pagina=home')
      if (contentRes.ok) {
        const contentData = await contentRes.json()
        if (contentData.success && contentData.conteudo) {
          const c = contentData.conteudo
          setContent({
            titulo: c.titulo || DEFAULTS.titulo,
            subtitulo: c.subtitulo || DEFAULTS.subtitulo,
            conteudo: { ...DEFAULTS.conteudo, ...c.conteudo }
          })
        }
      }

      // Load models
      const res = await fetch('/api/modelos')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const all = data.modelos
            .filter((m: any) => m.ativo)
            .map((m: any) => ({ ...m, fotos: m.fotos || [], videos: m.videos || [] })) as PessoaCompleta[]
          setTodos(all)
          setDestaques(shuffle(all.filter(p => p.destaque)).slice(0, 4))
          setOutros(shuffle(all.filter(p => !p.destaque)))
        }
      }
    } catch (err) {
      console.error('Error:', err)
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
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Destaques */}
        {destaques.length > 0 && (
          <section className="mb-24">
            <div className="mb-10">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">
                {content.conteudo.destaques_label}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-black">
                {content.conteudo.destaques_titulo}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
              {destaques.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} />
              ))}
            </div>
          </section>
        )}

        {/* Catalogo */}
        <section>
          <div className="mb-10">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">
              {content.conteudo.catalogo_label}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-black">
              {todos.length} Modelo{todos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {outros.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-sm tracking-widest uppercase">
                Nenhum modelo adicional cadastrado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2">
              {outros.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CTA */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              {content.conteudo.cta_titulo}
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              {content.conteudo.cta_texto}
            </p>
          </div>
          <Link
            href="/parceria"
            className="bg-black text-white px-10 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            {content.conteudo.cta_botao}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
