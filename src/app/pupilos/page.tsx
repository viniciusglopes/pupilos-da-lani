'use client'

import { useState, useEffect } from 'react'
import { PessoaCompleta } from '@/types/database'
import ModelCard from '@/components/ModelCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PupilosPage() {
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([])
  const [filteredPessoas, setFilteredPessoas] = useState<PessoaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
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
      
      const modelosCompletos = result.modelos.map((modelo: any) => ({
        ...modelo,
        fotos: modelo.fotos || [],
        videos: modelo.videos || []
      })) as PessoaCompleta[]
      
      setPessoas(modelosCompletos)
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...pessoas]

    // Filtro de busca por texto
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(pessoa =>
        pessoa.nome.toLowerCase().includes(searchLower) ||
        pessoa.descricao?.toLowerCase().includes(searchLower) ||
        pessoa.especializacoes?.some(esp => esp.toLowerCase().includes(searchLower)) ||
        pessoa.localizacao?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por sexo
    if (filters.sexo !== 'todos') {
      filtered = filtered.filter(pessoa => pessoa.sexo === filters.sexo)
    }

    // Filtro por idade
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black uppercase mb-4">
            Nossos Pupilos
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            Conheça nossos talentos profissionais. Use os filtros para encontrar o perfil ideal.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-gray-50 p-6 rounded-none mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca por texto */}
            <div>
              <input
                type="text"
                placeholder="Buscar por nome, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
              />
            </div>

            {/* Filtro por sexo */}
            <div>
              <select
                value={filters.sexo}
                onChange={(e) => setFilters(prev => ({ ...prev, sexo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
              >
                <option value="todos">Todos os Sexos</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            {/* Filtro por idade */}
            <div>
              <select
                value={filters.idade}
                onChange={(e) => setFilters(prev => ({ ...prev, idade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
              >
                <option value="todos">Todas as Idades</option>
                <option value="0-10">Até 10 anos</option>
                <option value="11-15">11 a 15 anos</option>
                <option value="16-18">16 a 18 anos</option>
                <option value="18+">Acima de 18 anos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats e controles */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-500">
              {filteredPessoas.length} de {pessoas.length} pupilos
            </p>
          </div>

          {/* Toggle Grid/List */}
          <div className="flex border border-gray-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Resultados */}
        {filteredPessoas.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm tracking-widest uppercase">
              Nenhum pupilo encontrado com os filtros selecionados
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start' : 'space-y-4'}>
            {filteredPessoas.map((pessoa) => (
              <ModelCard key={pessoa.id} pessoa={pessoa} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}