"use client"

import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DestaqueCarousel from '@/components/DestaqueCarousel'
import Link from 'next/link'

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
      
      {/* Hero Section - Half Screen */}
      <section className="min-h-screen flex">
        {/* Left Side - Content */}
        <div className="w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
          <div className="text-center text-white px-12">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">PL</span>
              </div>
              <h1 className="text-5xl font-bold mb-4">
                Pupilos da Lani
              </h1>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Conectando talentos com oportunidades.<br />
                Descubra modelos profissionais em Minas Gerais.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/busca"
                className="block w-full bg-white text-purple-700 font-bold py-4 px-8 rounded-lg hover:bg-purple-50 transition-colors"
              >
                🔍 Descobrir Talentos
              </Link>
              <Link
                href="/parceria"
                className="block w-full border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-purple-700 transition-colors"
              >
                🌟 Seja um Modelo
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Featured Model */}
        <div className="w-1/2 relative overflow-hidden">
          {destaquesCompletos.length > 0 && destaquesCompletos[0].fotos.length > 0 ? (
            <div className="h-full relative">
              <img 
                src={destaquesCompletos[0].fotos[0].url_arquivo}
                alt={destaquesCompletos[0].nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-bold mb-2">{destaquesCompletos[0].nome}</h3>
                <p className="text-lg text-white/90">{destaquesCompletos[0].localizacao}</p>
                <div className="mt-4">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    ⭐ Modelo em Destaque
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
              <div className="text-center text-purple-800">
                <div className="text-8xl mb-4">📸</div>
                <h3 className="text-2xl font-bold mb-2">Aguardando Talentos</h3>
                <p className="text-lg">Seja o primeiro modelo em destaque!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">

        {/* Categorias de Talentos */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Talentos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra modelos profissionais categorizados por especialidade
            </p>
          </div>

          {/* Grid de Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: 'Infantil', icon: '👶', color: 'from-blue-400 to-blue-600', count: pessoasCompletas.filter(p => p.especializacoes?.includes('Infantil')).length },
              { name: 'Teen', icon: '🧑‍🎓', color: 'from-green-400 to-green-600', count: pessoasCompletas.filter(p => p.especializacoes?.includes('Teen')).length },
              { name: 'Adulto', icon: '👩‍💼', color: 'from-purple-400 to-purple-600', count: pessoasCompletas.filter(p => p.especializacoes?.includes('Adulto')).length },
              { name: 'Comercial', icon: '📺', color: 'from-orange-400 to-orange-600', count: pessoasCompletas.filter(p => p.especializacoes?.includes('Comercial')).length }
            ].map((categoria) => (
              <div 
                key={categoria.name}
                className={`bg-gradient-to-br ${categoria.color} text-white p-6 rounded-xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{categoria.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{categoria.name}</h3>
                  <p className="text-white/90 text-sm mb-3">
                    {categoria.count} {categoria.count === 1 ? 'modelo' : 'modelos'}
                  </p>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium">
                    Ver Talentos →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Galeria de Modelos */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Galeria de Modelos
            </h2>
            <p className="text-gray-600">
              Conheça nosso catálogo completo de talentos
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