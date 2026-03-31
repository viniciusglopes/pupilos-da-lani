'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import AdminSidebar from '@/components/AdminSidebar'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo' | 'parceiro'>('todos')
  const router = useRouter()

  useEffect(() => {
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
      
      setPessoas(prev => prev.map(p => 
        p.id === id ? { ...p, ativo: !ativo } : p
      ))
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const deletePessoa = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${nome}? Esta acao nao pode ser desfeita.`)) {
      return
    }

    try {
      const pessoa = pessoas.find(p => p.id === id)
      if (pessoa) {
        for (const foto of pessoa.fotos) {
          if (foto.caminho_storage) {
            await supabase.storage
              .from('fotos')
              .remove([foto.caminho_storage])
          }
        }
        
        for (const video of pessoa.videos) {
          if (video.caminho_storage) {
            await supabase.storage
              .from('videos')
              .remove([video.caminho_storage])
          }
        }
      }

      const { error } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setPessoas(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao excluir pupilo')
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
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm uppercase tracking-wide">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
            Painel Administrativo
          </h1>
          <Link
            href="/admin/cadastro"
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
          >
            + Novo Pupilo
          </Link>
        </div>

        {/* Estatisticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-200 p-4">
            <div className="text-2xl font-bold text-black">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Total</div>
          </div>
          <div className="border border-gray-200 p-4">
            <div className="text-2xl font-bold text-black">{stats.ativos}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Ativos</div>
          </div>
          <div className="border border-gray-200 p-4">
            <div className="text-2xl font-bold text-black">{stats.inativos}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Inativos</div>
          </div>
          <div className="border border-gray-200 p-4">
            <div className="text-2xl font-bold text-black">{stats.parceiros}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Parceiros</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'todos', label: 'Todos', count: stats.total },
              { key: 'ativo', label: 'Ativos', count: stats.ativos },
              { key: 'inativo', label: 'Inativos', count: stats.inativos },
              { key: 'parceiro', label: 'Parceiros', count: stats.parceiros }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-sm transition-colors ${
                  filter === key 
                    ? 'bg-black text-white' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de pupilos */}
        {filteredPessoas.length === 0 ? (
          <div className="border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum pupilo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'todos' 
                ? 'Cadastre o primeiro pupilo para comecar.'
                : `Nao ha pupilos ${filter === 'ativo' ? 'ativos' : filter === 'inativo' ? 'inativos' : 'parceiros'} no momento.`
              }
            </p>
            <Link
              href="/admin/cadastro"
              className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
            >
              Cadastrar Pupilo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPessoas.map((pessoa) => (
              <div key={pessoa.id} className="border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  {/* Foto */}
                  <div className="flex-shrink-0">
                    {pessoa.foto_principal || pessoa.fotos[0] ? (
                      <Image
                        src={pessoa.foto_principal || pessoa.fotos[0].url_arquivo}
                        alt={pessoa.nome}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Informacoes */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pessoa.nome}
                      </h3>
                      {pessoa.parceria && (
                        <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium uppercase tracking-wide">
                          Parceiro
                        </span>
                      )}
                      <span className={`border px-2 py-1 text-xs font-medium ${
                        pessoa.ativo 
                          ? 'border-gray-300 text-gray-700' 
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {pessoa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Localizacao:</span>
                        <br />
                        {pessoa.localizacao || 'Nao informado'}
                      </div>
                      <div>
                        <span className="font-medium">Altura:</span>
                        <br />
                        {pessoa.altura ? `${pessoa.altura}cm` : 'Nao informado'}
                      </div>
                      <div>
                        <span className="font-medium">Fotos:</span>
                        <br />
                        {pessoa.fotos.length}
                      </div>
                      <div>
                        <span className="font-medium">Videos:</span>
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
                              className="border border-gray-300 text-gray-600 px-2 py-1 text-xs"
                            >
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acoes */}
                  <div className="flex-shrink-0 space-x-2">
                    <Link
                      href={`/admin/cadastro/${pessoa.id}/edit`}
                      className="border border-black text-black px-3 py-1 text-sm hover:bg-black hover:text-white transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => toggleAtivo(pessoa.id, pessoa.ativo)}
                      className="border border-gray-300 text-gray-700 px-3 py-1 text-sm hover:bg-gray-100 transition-colors"
                    >
                      {pessoa.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => deletePessoa(pessoa.id, pessoa.nome)}
                      className="border border-gray-300 text-gray-700 px-3 py-1 text-sm hover:bg-gray-100 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
