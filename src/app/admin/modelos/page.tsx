'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import AdminSidebar from '@/components/AdminSidebar'
import Image from 'next/image'
import Link from 'next/link'

const PAGE_SIZE = 48

export default function ModelosPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo' | 'parceiro' | 'destaque'>('todos')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagina, setPagina] = useState(0)
  const [layout, setLayout] = useState<'lista' | 'grid'>('lista')
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaCompleta | null>(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) { router.push('/login'); return }
  }, [router])

  const loadPessoas = useCallback(async (pg = 0, s = search, f = filter) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pessoas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: PAGE_SIZE,
          offset: pg * PAGE_SIZE,
          status: f === 'todos' ? '' : f,
          search: s,
        }),
      })
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setPessoas(data.pessoas as PessoaCompleta[])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error)
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => {
    loadPessoas(0, search, filter)
    setPagina(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleSearch = () => {
    setSearch(searchInput)
    setPagina(0)
    loadPessoas(0, searchInput, filter)
  }

  const irPagina = (pg: number) => {
    setPagina(pg)
    loadPessoas(pg, search, filter)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    const res = await fetch(`/api/admin/pessoas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo })
    })
    if (!res.ok) { alert('Erro ao atualizar status'); return }
    setPessoas(prev => prev.map(p => p.id === id ? { ...p, ativo: !ativo } : p))
  }

  const toggleDestaque = async (id: string, destaque: boolean) => {
    const res = await fetch(`/api/admin/pessoas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque: !destaque })
    })
    if (!res.ok) { alert('Erro ao atualizar destaque'); return }
    setPessoas(prev => prev.map(p => p.id === id ? { ...p, destaque: !destaque } : p))
  }

  const deletePessoa = async (id: string, nome: string) => {
    if (!confirm(`Excluir ${nome}? Esta ação não pode ser desfeita.`)) return
    try {
      const pessoa = pessoas.find(p => p.id === id)
      if (pessoa) {
        for (const foto of pessoa.fotos) {
          if (foto.caminho_storage) await supabase.storage.from('fotos').remove([foto.caminho_storage])
        }
        for (const video of pessoa.videos) {
          if (video.caminho_storage) await supabase.storage.from('videos').remove([video.caminho_storage])
        }
      }
      await supabase.from('pessoas').delete().eq('id', id)
      if (selectedPessoa?.id === id) setSelectedPessoa(null)
      loadPessoas(pagina, search, filter)
    } catch {
      alert('Erro ao excluir pupilo')
    }
  }

  const totalPaginas = Math.ceil(total / PAGE_SIZE)

  if (loading && pessoas.length === 0) {
    return (
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-black uppercase tracking-wide">Gerenciar Pupilos</h1>
              <p className="text-gray-400 text-sm mt-0.5">{total} pupilos cadastrados</p>
            </div>
            <Link href="/admin/cadastro"
              className="bg-black text-white px-5 py-2 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors">
              + Novo Pupilo
            </Link>
          </div>

          {/* Filtros de status */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total', key: 'todos' },
              { label: 'Ativos', key: 'ativo' },
              { label: 'Inativos', key: 'inativo' },
              { label: 'Parceiros', key: 'parceiro' },
              { label: 'Destaques', key: 'destaque' },
            ].map(({ label, key }) => (
              <button key={key} onClick={() => setFilter(key as any)}
                className={`p-4 border text-left transition-colors ${filter === key ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                <div className={`text-xs uppercase tracking-wide ${filter === key ? 'text-gray-300' : 'text-gray-500'}`}>{label}</div>
              </button>
            ))}
          </div>

          {/* Busca + layout toggle */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex flex-1 max-w-sm">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nome..."
                className="flex-1 px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
              />
              <button onClick={handleSearch}
                className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors">
                Buscar
              </button>
            </div>
            {search && (
              <button onClick={() => { setSearchInput(''); setSearch(''); setPagina(0); loadPessoas(0, '', filter) }}
                className="text-xs text-gray-400 hover:text-black underline">
                Limpar busca
              </button>
            )}
            <div className="ml-auto flex border border-gray-200">
              <button onClick={() => setLayout('lista')}
                className={`px-3 py-2 text-xs transition-colors ${layout === 'lista' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                ☰ Lista
              </button>
              <button onClick={() => setLayout('grid')}
                className={`px-3 py-2 text-xs transition-colors ${layout === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                ⊞ Grid
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-4 text-gray-400 text-sm">Carregando...</div>
          )}

          {/* Lista */}
          {!loading && pessoas.length === 0 ? (
            <div className="border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wide">Nenhum pupilo encontrado</p>
            </div>
          ) : layout === 'lista' ? (
            <div className="border border-gray-200 divide-y divide-gray-100">
              <div className="grid grid-cols-[56px_1fr_120px_80px_140px] gap-4 px-4 py-2 bg-gray-50">
                <div />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pupilo</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mídia</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Ações</div>
              </div>

              {pessoas.map((pessoa) => {
                const fotoUrl = pessoa.foto_principal || pessoa.fotos[0]?.url_arquivo
                return (
                  <div key={pessoa.id}
                    className={`grid grid-cols-[56px_1fr_120px_80px_140px] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors ${!pessoa.ativo ? 'opacity-60' : ''}`}>
                    <div className="w-14 h-14 flex-shrink-0 bg-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedPessoa(selectedPessoa?.id === pessoa.id ? null : pessoa)}>
                      {fotoUrl ? (
                        <Image src={fotoUrl} alt={pessoa.nome} width={56} height={56}
                          className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">--</div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-black text-sm leading-tight">{pessoa.nome}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {[pessoa.sexo, pessoa.idade ? `${pessoa.idade} anos` : null].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 text-xs font-medium ${pessoa.ativo ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400 line-through'}`}>
                        {pessoa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      {pessoa.destaque && <span className="px-2 py-0.5 text-xs bg-black text-white">Dest.</span>}
                      {pessoa.parceria && <span className="px-2 py-0.5 text-xs border border-black text-black">Parc.</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>{pessoa.fotos.length} foto{pessoa.fotos.length !== 1 ? 's' : ''}</div>
                      <div>{pessoa.videos.length} vídeo{pessoa.videos.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <Link href={`/admin/cadastro/${pessoa.id}/edit`}
                        className="px-3 py-1.5 text-xs bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wide">
                        Editar
                      </Link>
                      <button onClick={() => toggleDestaque(pessoa.id, pessoa.destaque)}
                        className={`px-3 py-1.5 text-xs transition-colors border ${pessoa.destaque ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}>
                        ★
                      </button>
                      <button onClick={() => toggleAtivo(pessoa.id, pessoa.ativo)}
                        className="px-3 py-1.5 text-xs transition-colors border border-gray-300 text-gray-600 hover:bg-gray-100">
                        {pessoa.ativo ? 'Off' : 'On'}
                      </button>
                      <button onClick={() => deletePessoa(pessoa.id, pessoa.nome)}
                        className="px-3 py-1.5 text-xs border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {pessoas.map((pessoa) => {
                const fotoUrl = pessoa.foto_principal || pessoa.fotos[0]?.url_arquivo
                return (
                  <div key={pessoa.id} className={`group relative border border-gray-200 hover:border-black transition-colors ${!pessoa.ativo ? 'opacity-50' : ''}`}>
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                      {fotoUrl ? (
                        <Image src={fotoUrl} alt={pessoa.nome} fill
                          className="object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">—</div>
                      )}
                      {/* Overlay de ações */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <Link href={`/admin/cadastro/${pessoa.id}/edit`}
                          className="w-full text-center px-2 py-1.5 bg-white text-black text-xs uppercase tracking-wide hover:bg-gray-100">
                          Editar
                        </Link>
                        <button onClick={() => toggleDestaque(pessoa.id, pessoa.destaque)}
                          className={`w-full px-2 py-1.5 text-xs border ${pessoa.destaque ? 'bg-yellow-400 text-black border-yellow-400' : 'border-white text-white hover:bg-white/10'}`}>
                          {pessoa.destaque ? '★ Destaque' : '☆ Destacar'}
                        </button>
                        <button onClick={() => toggleAtivo(pessoa.id, pessoa.ativo)}
                          className="w-full px-2 py-1.5 border border-white text-white text-xs hover:bg-white/10">
                          {pessoa.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onClick={() => deletePessoa(pessoa.id, pessoa.nome)}
                          className="w-full px-2 py-1.5 border border-red-400 text-red-400 text-xs hover:bg-red-400/10">
                          Excluir
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-semibold text-black truncate">{pessoa.nome}</div>
                      <div className="text-xs text-gray-400">{pessoa.fotos.length}f · {pessoa.videos.length}v</div>
                      {(pessoa.destaque || pessoa.parceria) && (
                        <div className="flex gap-1 mt-1">
                          {pessoa.destaque && <span className="text-xs bg-black text-white px-1">D</span>}
                          {pessoa.parceria && <span className="text-xs border border-black px-1">P</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => irPagina(pagina - 1)} disabled={pagina === 0}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wide">
                ← Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i)
                  .filter(i => i === 0 || i === totalPaginas - 1 || Math.abs(i - pagina) <= 2)
                  .map((i, idx, arr) => (
                    <span key={i}>
                      {idx > 0 && arr[idx - 1] !== i - 1 && <span className="px-2 text-gray-400">…</span>}
                      <button onClick={() => irPagina(i)}
                        className={`w-9 h-9 text-sm border transition-colors ${pagina === i ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}>
                        {i + 1}
                      </button>
                    </span>
                  ))}
              </div>
              <button onClick={() => irPagina(pagina + 1)} disabled={pagina >= totalPaginas - 1}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wide">
                Próxima →
              </button>
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-2">
            Página {pagina + 1} de {totalPaginas} · {total} pupilos
          </p>

          {/* Painel de detalhes (lista) */}
          {selectedPessoa && layout === 'lista' && (
            <div className="mt-6 border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-black uppercase tracking-wide">{selectedPessoa.nome}</h2>
                <div className="flex gap-2">
                  <Link href={`/admin/cadastro/${selectedPessoa.id}/edit`}
                    className="px-4 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800">
                    Editar
                  </Link>
                  <button onClick={() => setSelectedPessoa(null)}
                    className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
                    Fechar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Fotos ({selectedPessoa.fotos.length})
                  </p>
                  {selectedPessoa.fotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedPessoa.fotos.map((foto) => (
                        <div key={foto.id} className="relative group aspect-square">
                          <Image src={foto.url_arquivo} alt="" fill className="object-cover object-top" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={async () => {
                              if (!confirm('Excluir esta foto?')) return
                              if (foto.caminho_storage) await supabase.storage.from('fotos').remove([foto.caminho_storage])
                              await supabase.from('fotos').delete().eq('id', foto.id)
                              setSelectedPessoa(prev => prev ? { ...prev, fotos: prev.fotos.filter(f => f.id !== foto.id) } : prev)
                            }} className="bg-white text-black px-2 py-1 text-xs">
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Nenhuma foto</p>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dados</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {[
                        ['Sexo', selectedPessoa.sexo],
                        ['Idade', selectedPessoa.idade ? `${selectedPessoa.idade} anos` : null],
                        ['Altura', selectedPessoa.altura ? `${selectedPessoa.altura}cm` : null],
                        ['Local', selectedPessoa.localizacao],
                        ['Olhos', selectedPessoa.cor_olhos],
                        ['Cabelo', selectedPessoa.cor_cabelo],
                      ].map(([label, val]) => val ? (
                        <div key={label}><span className="text-gray-400">{label}:</span> <span className="text-black">{val}</span></div>
                      ) : null)}
                    </div>
                  </div>
                  {(selectedPessoa.especializacoes?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Especialidades</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPessoa.especializacoes?.map((esp, i) => (
                          <span key={i} className="border border-gray-200 text-gray-600 px-2 py-0.5 text-xs">{esp}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPessoa.descricao && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descrição</p>
                      <p className="text-sm text-gray-700">{selectedPessoa.descricao}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contato</p>
                    <div className="text-sm space-y-0.5">
                      {selectedPessoa.email && <div><span className="text-gray-400">Email:</span> {selectedPessoa.email}</div>}
                      {selectedPessoa.telefone && <div><span className="text-gray-400">WhatsApp:</span> {selectedPessoa.telefone}</div>}
                      {selectedPessoa.instagram_url && <div><span className="text-gray-400">Instagram:</span> <a href={selectedPessoa.instagram_url} target="_blank" rel="noopener noreferrer" className="underline">{selectedPessoa.instagram_url}</a></div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
