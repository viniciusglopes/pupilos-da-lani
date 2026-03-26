'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import AdminSidebar from '@/components/AdminSidebar'
import Image from 'next/image'
import Link from 'next/link'

export default function ModelosPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo' | 'parceiro' | 'destaque'>('todos')
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaCompleta | null>(null)
  const [showModal, setShowModal] = useState(false)
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
      
      setPessoas(prev => prev.map(p => 
        p.id === id ? { ...p, ativo: !ativo } : p
      ))
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const toggleDestaque = async (id: string, destaque: boolean) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ destaque: !destaque })
        .eq('id', id)

      if (error) throw error
      
      setPessoas(prev => prev.map(p => 
        p.id === id ? { ...p, destaque: !destaque } : p
      ))
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
    }
  }

  const deleteFoto = async (fotoId: string, caminho: string | null) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) {
      return
    }

    try {
      // Deletar do storage
      if (caminho && caminho.trim() !== '') {
        await supabase.storage.from('fotos').remove([caminho])
      }

      // Deletar do banco
      const { error } = await supabase
        .from('fotos')
        .delete()
        .eq('id', fotoId)

      if (error) throw error

      // Atualizar estado local
      if (selectedPessoa) {
        const updatedPessoa = {
          ...selectedPessoa,
          fotos: selectedPessoa.fotos.filter(f => f.id !== fotoId)
        }
        setSelectedPessoa(updatedPessoa)
        setPessoas(prev => prev.map(p => 
          p.id === selectedPessoa.id ? updatedPessoa : p
        ))
      }
      
      alert('Foto excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
      alert('Erro ao excluir foto')
    }
  }

  const deletePessoa = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${nome}? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
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

      const { error } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setPessoas(prev => prev.filter(p => p.id !== id))
      setShowModal(false)
      alert('Modelo excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao excluir modelo')
    }
  }

  const openModal = (pessoa: PessoaCompleta) => {
    setSelectedPessoa(pessoa)
    setShowModal(true)
  }

  const filteredPessoas = pessoas.filter(pessoa => {
    switch (filter) {
      case 'ativo': return pessoa.ativo
      case 'inativo': return !pessoa.ativo
      case 'parceiro': return pessoa.parceria
      case 'destaque': return pessoa.destaque
      default: return true
    }
  })

  const stats = {
    total: pessoas.length,
    ativos: pessoas.filter(p => p.ativo).length,
    inativos: pessoas.filter(p => !p.ativo).length,
    parceiros: pessoas.filter(p => p.parceria).length,
    destaques: pessoas.filter(p => p.destaque).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Modelos
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize, edite e gerencie todos os modelos cadastrados
              </p>
            </div>
            <Link
              href="/admin/cadastro"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Novo Modelo</span>
            </Link>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.destaques}</div>
              <div className="text-sm text-gray-600">Destaques</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'todos', label: 'Todos', count: stats.total },
                { key: 'ativo', label: 'Ativos', count: stats.ativos },
                { key: 'inativo', label: 'Inativos', count: stats.inativos },
                { key: 'parceiro', label: 'Parceiros', count: stats.parceiros },
                { key: 'destaque', label: 'Destaques', count: stats.destaques }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === key 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Grid de modelos */}
          {filteredPessoas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum modelo encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'todos' 
                  ? 'Cadastre o primeiro modelo para começar.'
                  : `Não há modelos ${filter} no momento.`
                }
              </p>
              <Link
                href="/admin/cadastro"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Cadastrar Modelo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPessoas.map((pessoa) => (
                <div key={pessoa.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-48">
                    {pessoa.foto_principal || pessoa.fotos[0] ? (
                      <Image
                        src={pessoa.foto_principal || pessoa.fotos[0].url_arquivo}
                        alt={pessoa.nome}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-sm">Sem fotos</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {pessoa.destaque && (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ⭐ DESTAQUE
                        </span>
                      )}
                      {pessoa.parceria && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          PARCEIRO
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pessoa.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pessoa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{pessoa.nome}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Local:</span>
                        <br />
                        {pessoa.localizacao || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Altura:</span>
                        <br />
                        {pessoa.altura ? `${pessoa.altura}cm` : 'N/A'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>📸 {pessoa.fotos.length} fotos</span>
                      <span>🎬 {pessoa.videos.length} vídeos</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => openModal(pessoa)}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        👁️ Ver Detalhes
                      </button>
                      <Link
                        href={`/admin/cadastro/${pessoa.id}/edit`}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => toggleDestaque(pessoa.id, pessoa.destaque)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          pessoa.destaque
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        ⭐ {pessoa.destaque ? 'Remover' : 'Destacar'}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAtivo(pessoa.id, pessoa.ativo)}
                        className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                          pessoa.ativo
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {pessoa.ativo ? '❌ Desativar' : '✅ Ativar'}
                      </button>
                      <button
                        onClick={() => deletePessoa(pessoa.id, pessoa.nome)}
                        className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de detalhes */}
        {showModal && selectedPessoa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">{selectedPessoa.nome}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Fotos */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Fotos ({selectedPessoa.fotos.length})
                  </h3>
                  {selectedPessoa.fotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedPessoa.fotos.map((foto) => (
                        <div key={foto.id} className="relative group">
                          <Image
                            src={foto.url_arquivo}
                            alt={`Foto de ${selectedPessoa.nome}`}
                            width={300}
                            height={300}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <button
                              onClick={() => deleteFoto(foto.id, foto.caminho_storage || '')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              🗑️ Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma foto cadastrada
                    </p>
                  )}
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Informações Básicas</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Localização:</strong> {selectedPessoa.localizacao || 'Não informado'}</p>
                      <p><strong>Altura:</strong> {selectedPessoa.altura ? `${selectedPessoa.altura}cm` : 'Não informado'}</p>
                      <p><strong>Peso:</strong> {selectedPessoa.peso ? `${selectedPessoa.peso}kg` : 'Não informado'}</p>
                      <p><strong>WhatsApp:</strong> {selectedPessoa.whatsapp || 'Não informado'}</p>
                      <p><strong>Instagram:</strong> {selectedPessoa.instagram || 'Não informado'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Ativo:</strong> {selectedPessoa.ativo ? 'Sim' : 'Não'}</p>
                      <p><strong>Destaque:</strong> {selectedPessoa.destaque ? 'Sim' : 'Não'}</p>
                      <p><strong>Parceiro:</strong> {selectedPessoa.parceria ? 'Sim' : 'Não'}</p>
                      <p><strong>Cadastro:</strong> {new Date(selectedPessoa.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                {selectedPessoa.descricao && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Descrição</h4>
                    <p className="text-sm text-gray-700">{selectedPessoa.descricao}</p>
                  </div>
                )}

                {selectedPessoa.especializacoes && selectedPessoa.especializacoes.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Especializações</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPessoa.especializacoes.map((esp, index) => (
                        <span 
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm"
                        >
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}