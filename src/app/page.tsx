import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
      {/* CSS para carousel de fotos */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 20% { opacity: 1; }
          25%, 95% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .carousel-container {
          position: relative;
          overflow: hidden;
        }
        
        .carousel-image {
          transition: opacity 1s ease-in-out;
        }
        
        /* Animação específica para cada foto */
        .carousel-container img:nth-child(1) { animation-delay: 0s; }
        .carousel-container img:nth-child(2) { animation-delay: 4s; }
        .carousel-container img:nth-child(3) { animation-delay: 8s; }
        .carousel-container img:nth-child(4) { animation-delay: 12s; }
        .carousel-container img:nth-child(5) { animation-delay: 16s; }
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
                  <div key={pessoa.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative h-80">
                      {pessoa.fotos.length > 0 ? (
                        <div className="carousel-container h-full">
                          {pessoa.fotos.map((foto, index) => (
                            <img 
                              key={foto.id}
                              src={foto.url_arquivo} 
                              alt={pessoa.nome}
                              className={`carousel-image absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
                              style={{
                                animationDelay: `${index * 4}s`,
                                animation: pessoa.fotos.length > 1 ? `fadeInOut ${pessoa.fotos.length * 4}s infinite` : 'none'
                              }}
                            />
                          ))}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-bold">{pessoa.nome}</h3>
                            <p className="text-sm opacity-90">{pessoa.localizacao}</p>
                          </div>
                          {pessoa.parceria && (
                            <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              PARCEIRO
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">📸</div>
                            <p className="text-sm">Sem fotos</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{pessoa.nome}</h3>
                      {pessoa.especializacoes && pessoa.especializacoes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {pessoa.especializacoes.slice(0, 3).map(esp => (
                            <span key={esp} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {esp}
                            </span>
                          ))}
                        </div>
                      )}
                      {pessoa.descricao && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {pessoa.descricao}
                        </p>
                      )}
                    </div>
                  </div>
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