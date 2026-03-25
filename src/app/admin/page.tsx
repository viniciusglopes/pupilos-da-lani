'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo' | 'parceiro'>('todos')
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadPessoas()
  }, [router])

  const loadPessoas = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          *,
          fotos (*),
          videos (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPessoas(data as PessoaCompleta[])
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ ativo: !ativo })
        .eq('id', id)

      if (error) throw error
      
      // Atualizar estado local
      setPessoas(prev => prev.map(p => 
        p.id === id ? { ...p, ativo: !ativo } : p
      ))
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const deletePessoa = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${nome}? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      // Primeiro, deletar arquivos do storage
      const pessoa = pessoas.find(p => p.id === id)
      if (pessoa) {
        // Deletar fotos
        for (const foto of pessoa.fotos) {
          if (foto.caminho_storage) {
            await supabase.storage
              .from('fotos')
              .remove([foto.caminho_storage])
          }
        }
        
        // Deletar vídeos
        for (const video of pessoa.videos) {
          if (video.caminho_storage) {
            await supabase.storage
              .from('videos')
              .remove([video.caminho_storage])
          }
        }
      }

      // Deletar pessoa (cascade deleta fotos/videos automaticamente)
      const { error } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Atualizar estado local
      setPessoas(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao excluir modelo')
    }
  }

  const filteredPessoas = pessoas.filter(pessoa => {
    switch (filter) {
      case 'ativo': return pessoa.ativo
      case 'inativo': return !pessoa.ativo
      case 'parceiro': return pessoa.parceria
      default: return true
    }
  })

  const stats = {
    total: pessoas.length,
    ativos: pessoas.filter(p => p.ativo).length,
    inativos: pessoas.filter(p => !p.ativo).length,
    parceiros: pessoas.filter(p => p.parceria).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Administrativo
          </h1>
          <Link
            href="/admin/cadastro"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Novo Modelo
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.inativos}</div>
            <div className="text-sm text-gray-600">Inativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.parceiros}</div>
            <div className="text-sm text-gray-600">Parceiros</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'todos' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setFilter('ativo')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ativos ({stats.ativos})
            </button>
            <button
              onClick={() => setFilter('inativo')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'inativo' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inativos ({stats.inativos})
            </button>
            <button
              onClick={() => setFilter('parceiro')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'parceiro' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Parceiros ({stats.parceiros})
            </button>
          </div>
        </div>

        {/* Lista de modelos */}
        {filteredPessoas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum modelo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'todos' 
                ? 'Cadastre o primeiro modelo para começar.'
                : `Não há modelos ${filter === 'ativo' ? 'ativos' : filter === 'inativo' ? 'inativos' : 'parceiros'} no momento.`
              }
            </p>
            <Link
              href="/admin/cadastro"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Cadastrar Modelo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPessoas.map((pessoa) => (
              <div key={pessoa.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  {/* Foto */}
                  <div className="flex-shrink-0">
                    {pessoa.foto_principal || pessoa.fotos[0] ? (
                      <Image
                        src={pessoa.foto_principal || pessoa.fotos[0].url_arquivo}
                        alt={pessoa.nome}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pessoa.nome}
                      </h3>
                      {pessoa.parceria && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Parceiro
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pessoa.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pessoa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Localização:</span>
                        <br />
                        {pessoa.localizacao || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Altura:</span>
                        <br />
                        {pessoa.altura ? `${pessoa.altura}cm` : 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Fotos:</span>
                        <br />
                        {pessoa.fotos.length}
                      </div>
                      <div>
                        <span className="font-medium">Vídeos:</span>
                        <br />
                        {pessoa.videos.length}
                      </div>
                    </div>

                    {pessoa.especializacoes && pessoa.especializacoes.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {pessoa.especializacoes.map((esp, index) => (
                            <span 
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex-shrink-0 space-x-2">
                    <Link
                      href={`/admin/cadastro/${pessoa.id}/edit`}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => toggleAtivo(pessoa.id, pessoa.ativo)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        pessoa.ativo
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {pessoa.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => deletePessoa(pessoa.id, pessoa.nome)}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}