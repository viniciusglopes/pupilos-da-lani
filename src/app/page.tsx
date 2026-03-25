import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function HomePage() {
  // Buscar todas as pessoas ativas
  const { data: pessoas, error } = await supabase
    .from('pessoas')
    .select(`
      *,
      fotos (*),
      videos (*)
    `)
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar pessoas:', error)
    return <div>Erro ao carregar modelos</div>
  }

  const pessoasCompletas = pessoas as PessoaCompleta[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pupilos da Lani
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conectando talentos com oportunidades. 
            Descubra modelos profissionais em Minas Gerais.
          </p>
        </div>

        {pessoasCompletas.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Ainda não temos modelos cadastrados
            </h2>
            <p className="text-gray-500">
              Em breve teremos nosso primeiro catálogo!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pessoasCompletas.map((pessoa) => (
              <ModelCard key={pessoa.id} pessoa={pessoa} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Total: {pessoasCompletas.length} modelo{pessoasCompletas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}