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
  const [filters, setFilters] = useState({
    especialidade: '',
    localizacao: '',
    alturaMin: '',
    alturaMax: '',
    parceria: 'todos' // todos, parceiro, nao-parceiro
  })

  useEffect(() => {
    loadPessoas()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [pessoas, searchTerm, filters])

  const loadPessoas = async () => {
    try {
      console.log('🔍 Carregando pessoas via API...')
      
      // Usar nossa nova API GET /modelos
      const response = await fetch('/api/modelos')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na API')
      }
      
      console.log(`✅ ${result.modelos.length} modelos carregados`)
      
      // Adicionar campos fotos/videos vazios para compatibilidade  
      const modelosCompleitos = result.modelos.map((modelo: any) => ({
        ...modelo,
        fotos: modelo.fotos || [],
        videos: modelo.videos || []
      }))
      
      setPessoas(modelosCompleitos as PessoaCompleta[])
      
    } catch (error) {
      console.error('❌ Erro ao carregar pessoas:', error)
      
      // FALLBACK: Se API falhar, tenta Supabase direto
      console.log('🔄 Tentando fallback Supabase direto...')
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
        console.log(`✅ Fallback: ${data.length} modelos carregados`)
        setPessoas(data as PessoaCompleta[])
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...pessoas]

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase()
      filtered = filtered.filter(pessoa =>
        pessoa.nome.toLowerCase().includes(termo) ||
        pessoa.descricao?.toLowerCase().includes(termo) ||
        pessoa.localizacao?.toLowerCase().includes(termo) ||
        pessoa.especializacoes?.some(esp => esp.toLowerCase().includes(termo))
      )
    }

    // Filtro por especialidade
    if (filters.especialidade) {
      filtered = filtered.filter(pessoa =>
        pessoa.especializacoes?.some(esp => 
          esp.toLowerCase().includes(filters.especialidade.toLowerCase())
        )
      )
    }

    // Filtro por localização
    if (filters.localizacao) {
      filtered = filtered.filter(pessoa =>
        pessoa.localizacao?.toLowerCase().includes(filters.localizacao.toLowerCase())
      )
    }

    // Filtro por altura mínima
    if (filters.alturaMin) {
      filtered = filtered.filter(pessoa =>
        pessoa.altura && pessoa.altura >= parseInt(filters.alturaMin)
      )
    }

    // Filtro por altura máxima
    if (filters.alturaMax) {
      filtered = filtered.filter(pessoa =>
        pessoa.altura && pessoa.altura <= parseInt(filters.alturaMax)
      )
    }

    // Filtro por parceria
    if (filters.parceria === 'parceiro') {
      filtered = filtered.filter(pessoa => pessoa.parceria)
    } else if (filters.parceria === 'nao-parceiro') {
      filtered = filtered.filter(pessoa => !pessoa.parceria)
    }

    setFilteredPessoas(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      especialidade: '',
      localizacao: '',
      alturaMin: '',
      alturaMax: '',
      parceria: 'todos'
    })
  }

  // Extrair valores únicos para options
  const especialidadesUnicas = [...new Set(
    pessoas.flatMap(p => p.especializacoes || [])
  )].sort()

  const localizacoesUnicas = [...new Set(
    pessoas.map(p => p.localizacao).filter(Boolean) as string[]
  )].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando modelos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Descobrir Talentos
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Encontre o modelo ideal para seu projeto usando nossos filtros avançados
          </p>
          
          {/* Quick Search */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Buscar por nome, especialidade ou localização..."
              className="w-full px-6 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-6 -mt-8 relative z-10">
        {/* Filtros Avançados */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Filtros Avançados</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-full">
                {filteredPessoas.length} resultado{filteredPessoas.length !== 1 ? 's' : ''}
              </span>
              {(searchTerm || Object.values(filters).some(v => v && v !== 'todos')) && (
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors"
                >
                  🗑️ Limpar Filtros
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

            {/* Especialidade */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                🎭 Especialidade
              </label>
              <select
                value={filters.especialidade}
                onChange={(e) => setFilters(prev => ({ ...prev, especialidade: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Todas as especialidades</option>
                {especialidadesUnicas.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📍 Localização
              </label>
              <select
                value={filters.localizacao}
                onChange={(e) => setFilters(prev => ({ ...prev, localizacao: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Todas as cidades</option>
                {localizacoesUnicas.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Faixa de Altura */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📏 Altura (cm)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.alturaMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, alturaMin: e.target.value }))}
                  placeholder="Mín"
                  min="100"
                  max="250"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <span className="flex items-center px-2 text-gray-500">-</span>
                <input
                  type="number"
                  value={filters.alturaMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, alturaMax: e.target.value }))}
                  placeholder="Máx"
                  min="100"
                  max="250"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tipo de parceria */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                🤝 Parceria
              </label>
              <div className="flex space-x-2">
                {[
                  { key: 'todos', label: 'Todos', color: 'gray' },
                  { key: 'parceiro', label: 'Parceiros', color: 'blue' },
                  { key: 'nao-parceiro', label: 'Freelancers', color: 'green' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setFilters(prev => ({ ...prev, parceria: option.key }))}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      filters.parceria === option.key
                        ? `bg-${option.color}-600 text-white shadow-lg`
                        : `bg-${option.color}-50 text-${option.color}-700 hover:bg-${option.color}-100`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">📊 Estatísticas dos Resultados</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total', value: filteredPessoas.length, icon: '👥', color: 'purple' },
                    { label: 'Parceiros', value: filteredPessoas.filter(p => p.parceria).length, icon: '🤝', color: 'blue' },
                    { label: 'Com Fotos', value: filteredPessoas.filter(p => p.fotos.length > 0).length, icon: '📸', color: 'green' },
                    { label: 'Com Vídeos', value: filteredPessoas.filter(p => p.videos.length > 0).length, icon: '🎬', color: 'orange' }
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className={`text-2xl text-${stat.color}-600 font-bold`}>
                        {stat.icon} {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
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
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nenhum modelo encontrado
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Não encontramos modelos que atendam aos seus critérios. Tente ajustar os filtros ou fazer uma busca mais ampla.
              </p>
              <div className="space-y-4">
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-8 py-3 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
                >
                  🗑️ Limpar Filtros
                </button>
                <div className="text-sm text-gray-500">
                  Ou explore todas as categorias na <a href="/" className="text-purple-600 hover:text-purple-800 font-medium">página inicial</a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header dos Resultados */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Resultados da Busca
                </h2>
                <div className="flex space-x-3">
                  {/* Views Toggle */}
                  <div className="bg-white rounded-lg shadow-md p-1 flex">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      📱 Grid
                    </button>
                    <button className="text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                      📋 Lista
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de Modelos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredPessoas.map((pessoa) => (
                  <ModelCard key={pessoa.id} pessoa={pessoa} />
                ))}
              </div>

              {/* Load More Button */}
              {filteredPessoas.length > 8 && (
                <div className="text-center mt-12">
                  <button className="bg-white text-purple-700 font-semibold px-8 py-3 rounded-full border-2 border-purple-200 hover:bg-purple-50 transition-all">
                    Ver Mais Modelos
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