import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

// Simple shuffle using Fisher-Yates
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const revalidate = 0 // no cache, always fresh

export default async function HomePage() {
  const { data: allPessoas } = await supabase
    .from('pessoas')
    .select(`*, fotos (*), videos (*)`)
    .eq('ativo', true)

  const todos = (allPessoas || []) as PessoaCompleta[]
  const destaques = shuffle(todos.filter(p => p.destaque)).slice(0, 4)
  const outros = shuffle(todos.filter(p => !p.destaque))
  const gridModels = [...outros]

  // Hero featured: first destaque with photo
  const heroModel = destaques.find(d => d.fotos.length > 0)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero — full viewport, split layout */}
      <section className="h-screen flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center px-12 md:px-20">
          <div className="max-w-md">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-none text-black uppercase">
              Pupilos<br />da Lani
            </h1>
            <p className="mt-6 text-gray-500 text-base leading-relaxed">
              Conectando talentos com oportunidades.<br />
              Modelos profissionais em Minas Gerais.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/busca"
                className="bg-black text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
              >
                Ver Talentos
              </Link>
              <Link
                href="/parceria"
                className="border border-black text-black px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
              >
                Seja Modelo
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-100">
          {heroModel ? (
            <>
              <img
                src={heroModel.fotos[0].url_arquivo}
                alt={heroModel.nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-8">
                <span className="text-xs font-semibold tracking-widest uppercase text-white/80 bg-black/40 px-4 py-2">
                  {heroModel.nome} — Destaque
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 text-sm tracking-widest uppercase">Em breve</span>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Destaques Section — up to 4 */}
        {destaques.length > 0 && (
          <section className="mb-24">
            <div className="mb-10">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">Destaques</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-black">
                Modelos em Evidência
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
              {destaques.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} />
              ))}
            </div>
          </section>
        )}

        {/* All Models Grid */}
        <section>
          <div className="mb-10">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">Nosso Catálogo</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-black">
              {todos.length} Modelo{todos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {gridModels.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-sm tracking-widest uppercase">
                Nenhum modelo adicional cadastrado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2">
              {gridModels.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CTA Section */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Quer fazer parte?
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Cadastre-se como modelo e conecte-se com oportunidades profissionais.
            </p>
          </div>
          <Link
            href="/parceria"
            className="bg-black text-white px-10 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Cadastre-se
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
