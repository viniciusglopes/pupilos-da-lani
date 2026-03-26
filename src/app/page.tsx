"use client"

import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DestaqueCarousel from '@/components/DestaqueCarousel'

export default async function HomePage() {
  // Buscar pessoas em destaque
  const { data: destaques, error: errorDestaques } = await supabase
    .from('pessoas')
    .select(`
      *,
      fotos (*),
      videos (*)
    `)
    .eq('ativo', true)
    .eq('destaque', true)
    .order('created_at', { ascending: false })

  // Buscar todas as pessoas ativas (não destaques)
  const { data: pessoas, error } = await supabase
    .from('pessoas')
    .select(`
      *,
      fotos (*),
      videos (*)
    `)
    .eq('ativo', true)
    .eq('destaque', false)
    .order('created_at', { ascending: false })

  if (error || errorDestaques) {
    console.error('Erro ao buscar pessoas:', error || errorDestaques)
    return <div>Erro ao carregar modelos</div>
  }

  const pessoasCompletas = pessoas as PessoaCompleta[]
  const destaquesCompletos = destaques as PessoaCompleta[]

  return (
    <div className="min-h-screen bg-white">
      {/* CSS para carousel de fotos - 3 segundos */}
      <style jsx>{`
        .carousel-container {
          position: relative;
          overflow: hidden;
        }
        
        .carousel-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }
        
        .carousel-image.active {
          opacity: 1;
        }
        
        .carousel-container:hover .carousel-controls {
          opacity: 1;
        }
        
        .carousel-controls {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .carousel-dot.active {
          background: white;
        }
      `}</style>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Pupilos da Lani
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Conectando talentos com oportunidades. 
            Descubra modelos profissionais em Minas Gerais.
          </p>
        </div>

        {/* Área de Destaques */}
        {destaquesCompletos.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-2">
                ⭐ Modelos em Destaque
              </h2>
              <p className="text-gray-600">
                Nossos principais talentos selecionados
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destaquesCompletos.map((pessoa) => (
                  <DestaqueCarousel key={pessoa.id} pessoa={pessoa} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Todos os Modelos */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              📋 Todos os Modelos
            </h2>
            <p className="text-gray-600">
              Explore nosso catálogo completo
            </p>
          </div>

          {pessoasCompletas.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {destaquesCompletos.length > 0 ? 'Nenhum modelo adicional cadastrado' : 'Ainda não temos modelos cadastrados'}
              </h3>
              <p className="text-gray-500">
                {destaquesCompletos.length > 0 ? 'Apenas modelos em destaque disponíveis no momento' : 'Em breve teremos nosso primeiro catálogo!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pessoasCompletas.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} />
              ))}
            </div>
          )}
        </section>

        <div className="text-center mt-12">
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 text-lg font-medium mb-2">
              📊 Estatísticas do Portal
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div>
                <span className="font-bold text-purple-600">{destaquesCompletos.length}</span> em destaque
              </div>
              <div>
                <span className="font-bold text-blue-600">{pessoasCompletas.length}</span> modelo{pessoasCompletas.length !== 1 ? 's' : ''} total
              </div>
              <div>
                <span className="font-bold text-green-600">{destaquesCompletos.length + pessoasCompletas.length}</span> no catálogo
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}