import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function HomePage() {
  const { data: destaques } = await supabase
    .from('pessoas')
    .select(`*, fotos (*), videos (*)`)
    .eq('ativo', true)
    .eq('destaque', true)
    .order('created_at', { ascending: false })

  const { data: pessoas } = await supabase
    .from('pessoas')
    .select(`*, fotos (*), videos (*)`)
    .eq('ativo', true)
    .eq('destaque', false)
    .order('created_at', { ascending: false })

  const destaquesCompletos = (destaques || []) as PessoaCompleta[]
  const pessoasCompletas = (pessoas || []) as PessoaCompleta[]
  const todos = [...destaquesCompletos, ...pessoasCompletas]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero — full viewport, split layout */}
      <section className="h-screen flex flex-col md:flex-row">
        {/* Left — Text */}
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

        {/* Right — Featured image */}
        <div className="flex-1 relative bg-gray-100">
          {destaquesCompletos.length > 0 && destaquesCompletos[0].fotos.length > 0 ? (
            <>
              <img
                src={destaquesCompletos[0].fotos[0].url_arquivo}
                alt={destaquesCompletos[0].nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-8">
                <span className="text-xs font-semibold tracking-widest uppercase text-white/80 bg-black/40 px-4 py-2">
                  {destaquesCompletos[0].nome} — Destaque
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

      {/* Models Grid */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">Nosso Catálogo</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-black">
            {todos.length} Modelo{todos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm tracking-widest uppercase">
              Nenhum modelo cadastrado ainda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2">
            {todos.map((pessoa) => (
              <ModelCard key={pessoa.id} pessoa={pessoa} />
            ))}
          </div>
        )}
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
