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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Buscar Modelos
          </h1>
          <p className="text-gray-600">
            Use os filtros abaixo para encontrar o modelo ideal para seu projeto
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Busca geral */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Busca Geral
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, descrição, localização..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Especialidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidade
              </label>
              <select
                value={filters.especialidade}
                onChange={(e) => setFilters(prev => ({ ...prev, especialidade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {especialidadesUnicas.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <select
                value={filters.localizacao}
                onChange={(e) => setFilters(prev => ({ ...prev, localizacao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {localizacoesUnicas.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Altura mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altura Mínima (cm)
              </label>
              <input
                type="number"
                value={filters.alturaMin}
                onChange={(e) => setFilters(prev => ({ ...prev, alturaMin: e.target.value }))}
                placeholder="Ex: 160"
                min="100"
                max="250"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Altura máxima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altura Máxima (cm)
              </label>
              <input
                type="number"
                value={filters.alturaMax}
                onChange={(e) => setFilters(prev => ({ ...prev, alturaMax: e.target.value }))}
                placeholder="Ex: 180"
                min="100"
                max="250"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tipo de parceria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Parceria
              </label>
              <select
                value={filters.parceria}
                onChange={(e) => setFilters(prev => ({ ...prev, parceria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="parceiro">Apenas Parceiros</option>
                <option value="nao-parceiro">Não Parceiros</option>
              </select>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {filteredPessoas.length} modelo{filteredPessoas.length !== 1 ? 's' : ''} encontrado{filteredPessoas.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        {filteredPessoas.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum modelo encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros para encontrar outros modelos
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPessoas.map((pessoa) => (
              <ModelCard key={pessoa.id} pessoa={pessoa} />
            ))}
          </div>
        )}

        {/* Estatísticas dos filtros */}
        {filteredPessoas.length > 0 && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Resumo da Busca:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Total:</span> {filteredPessoas.length}
              </div>
              <div>
                <span className="font-medium">Parceiros:</span> {filteredPessoas.filter(p => p.parceria).length}
              </div>
              <div>
                <span className="font-medium">Com Fotos:</span> {filteredPessoas.filter(p => p.fotos.length > 0).length}
              </div>
              <div>
                <span className="font-medium">Com Vídeos:</span> {filteredPessoas.filter(p => p.videos.length > 0).length}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}