import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function ParceriaPage() {
  // Buscar apenas pessoas ativas com parceria
  const { data: pessoas, error } = await supabase
    .from('pessoas')
    .select(`
      *,
      fotos (*),
      videos (*)
    `)
    .eq('ativo', true)
    .eq('parceria', true)
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
            Modelos Parceiros
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nossos modelos em parceria exclusiva, prontos para seus projetos.
          </p>
          <div className="mt-4">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Ver todos os modelos
            </Link>
          </div>
        </div>

        {pessoasCompletas.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Ainda não temos parceiros exclusivos
            </h2>
            <p className="text-gray-500 mb-4">
              Em breve teremos nosso primeiro modelo parceiro!
            </p>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos os modelos disponíveis
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <div className="text-blue-600 mr-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-800 font-medium">
                  Modelos em parceria exclusiva - disponibilidade garantida
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pessoasCompletas.map((pessoa) => (
                <ModelCard key={pessoa.id} pessoa={pessoa} isParceiro={true} />
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            {pessoasCompletas.length} modelo{pessoasCompletas.length !== 1 ? 's' : ''} parceiro{pessoasCompletas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}