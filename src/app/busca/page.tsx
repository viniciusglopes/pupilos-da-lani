'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BuscaPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [filteredPessoas, setFilteredPessoas] = useState<PessoaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    especialidade: '',
    sexo: 'todos',
    idade: 'todos'
  })

  useEffect(() => {
    loadPessoas()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [pessoas, searchTerm, filters])

  const loadPessoas = async () => {
    try {
      console.log('Carregando pessoas via API...')
      
      const response = await fetch('/api/modelos')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na API')
      }
      
      console.log(`${result.modelos.length} pupilos carregados`)
      
      const modelosCompleitos = result.modelos.map((modelo: any) => ({
        ...modelo,
        fotos: modelo.fotos || [],
        videos: modelo.videos || []
      }))
      
      setPessoas(modelosCompleitos as PessoaCompleta[])
      
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error)
      
      console.log('Tentando fallback Supabase direto...')
      try {
        const { data, error } = await supabase
          .from('pessoas')
          .select(`
            *,
            fotos (*),
            videos (*)
          `)
          .eq('ativo', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        console.log(`Fallback: ${data.length} pupilos carregados`)
        setPessoas(data as PessoaCompleta[])
      } catch (fallbackError) {
        console.error('Fallback tambem falhou:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...pessoas]

    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase()
      filtered = filtered.filter(pessoa =>
        pessoa.nome.toLowerCase().includes(termo) ||
        pessoa.descricao?.toLowerCase().includes(termo) ||
        pessoa.localizacao?.toLowerCase().includes(termo) ||
        pessoa.especializacoes?.some(esp => esp.toLowerCase().includes(termo))
      )
    }

    if (filters.especialidade) {
      filtered = filtered.filter(pessoa =>
        pessoa.especializacoes?.some(esp => 
          esp.toLowerCase().includes(filters.especialidade.toLowerCase())
        )
      )
    }

    if (filters.sexo !== 'todos') {
      const sexoMap: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino' }
      filtered = filtered.filter(pessoa => pessoa.sexo === sexoMap[filters.sexo])
    }

    if (filters.idade !== 'todos') {
      filtered = filtered.filter(pessoa => {
        const idade = pessoa.idade
        if (!idade) return false
        if (filters.idade === '0-10') return idade <= 10
        if (filters.idade === '11-15') return idade >= 11 && idade <= 15
        if (filters.idade === '16-18') return idade >= 16 && idade <= 18
        if (filters.idade === '18+') return idade > 18
        return true
      })
    }

    setFilteredPessoas(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      especialidade: '',
      sexo: 'todos',
      idade: 'todos'
    })
  }

  const especialidadesUnicas = [...new Set(
    pessoas.flatMap(p => p.especializacoes || [])
  )].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm uppercase tracking-wide">Carregando pupilos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4 uppercase tracking-wide">
            Descobrir Talentos
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Encontre o pupilo ideal para seu projeto usando nossos filtros avancados
          </p>
          
          {/* Quick Search */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, especialidade ou localizacao..."
              className="w-full px-6 py-4 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border border-gray-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            )}
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-6 py-12">
        {/* Filtros Avancados */}
        <div className="border border-gray-200 p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Filtros</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 border border-gray-300 px-4 py-2">
                {filteredPessoas.length} resultado{filteredPessoas.length !== 1 ? 's' : ''}
              </span>
              {(searchTerm || Object.values(filters).some(v => v && v !== 'todos')) && (
                <button
                  onClick={clearFilters}
                  className="text-black text-sm font-medium border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

            {/* Especialidade */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Especialidade
              </label>
              <select
                value={filters.especialidade}
                onChange={(e) => setFilters(prev => ({ ...prev, especialidade: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              >
                <option value="">Todas as especialidades</option>
                {especialidadesUnicas.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Sexo
              </label>
              <div className="flex space-x-2">
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'masculino', label: 'Masculino' },
                  { key: 'feminino', label: 'Feminino' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setFilters(prev => ({ ...prev, sexo: option.key }))}
                    className={`flex-1 px-4 py-3 font-medium transition-all text-sm ${
                      filters.sexo === option.key
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Idade */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Faixa de Idade
              </label>
              <select
                value={filters.idade}
                onChange={(e) => setFilters(prev => ({ ...prev, idade: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              >
                <option value="todos">Todas as idades</option>
                <option value="0-10">Até 10 anos</option>
                <option value="11-15">11 a 15 anos</option>
                <option value="16-18">16 a 18 anos</option>
                <option value="18+">Acima de 18 anos</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="border border-gray-200 p-6">
                <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">Estatisticas dos Resultados</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total', value: filteredPessoas.length },
                    { label: 'Com Fotos', value: filteredPessoas.filter(p => p.fotos.length > 0).length },
                    { label: 'Com Videos', value: filteredPessoas.filter(p => p.videos.length > 0).length }
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl text-black font-bold">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <section className="mb-16">
          {filteredPessoas.length === 0 ? (
            <div className="border border-gray-200 p-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Nenhum pupilo encontrado
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Nao encontramos pupilos que atendam aos seus criterios. Tente ajustar os filtros ou fazer uma busca mais ampla.
              </p>
              <div className="space-y-4">
                <button
                  onClick={clearFilters}
                  className="bg-black text-white font-semibold px-8 py-3 hover:bg-gray-800 transition-all uppercase tracking-wide text-sm"
                >
                  Limpar Filtros
                </button>
                <div className="text-sm text-gray-500">
                  Ou explore todas as categorias na <a href="/" className="text-black underline font-medium">pagina inicial</a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header dos Resultados */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  Resultados
                </h2>
                <div className="flex space-x-3">
                  <div className="border border-gray-200 p-1 flex">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Grid
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all ${
                        viewMode === 'list' 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Lista
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid/List de Pupilos */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredPessoas.map((pessoa) => (
                    <ModelCard key={pessoa.id} pessoa={pessoa} source="busca" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPessoas.map((pessoa) => (
                    <div key={pessoa.id} className="border border-gray-200 p-6 flex">
                      <div className="flex-shrink-0 w-24 h-32 bg-gray-100 mr-6">
                        {pessoa.foto_principal || pessoa.fotos[0] ? (
                          <img 
                            src={pessoa.foto_principal || pessoa.fotos[0].url_arquivo} 
                            alt={pessoa.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sem foto
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-black mb-2">{pessoa.nome}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Local:</span><br />
                            {pessoa.localizacao || 'Não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Altura:</span><br />
                            {pessoa.altura ? `${pessoa.altura}cm` : 'Não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Fotos:</span><br />
                            {pessoa.fotos.length}
                          </div>
                          <div>
                            <span className="font-medium">Videos:</span><br />
                            {pessoa.videos.length}
                          </div>
                        </div>
                        {pessoa.descricao && (
                          <p className="text-sm text-gray-600 line-clamp-2">{pessoa.descricao}</p>
                        )}
                        {pessoa.especializacoes && pessoa.especializacoes.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {pessoa.especializacoes.slice(0, 3).map((esp, index) => (
                              <span key={index} className="text-xs border border-gray-300 text-gray-600 px-2 py-1">
                                {esp}
                              </span>
                            ))}
                            {pessoa.especializacoes.length > 3 && (
                              <span className="text-xs text-gray-400">+{pessoa.especializacoes.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {filteredPessoas.length > 8 && (
                <div className="text-center mt-12">
                  <button className="text-black font-semibold px-8 py-3 border border-black hover:bg-black hover:text-white transition-all uppercase tracking-wide text-sm">
                    Ver Mais Pupilos
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
