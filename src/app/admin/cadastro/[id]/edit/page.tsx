'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta, Foto, Video } from '@/types/database'
import AdminSidebar from '@/components/AdminSidebar'
import Image from 'next/image'

export default function EditModelPage() {
  const [pessoa, setPessoa] = useState<PessoaCompleta | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (id) {
      loadPessoa()
    }
  }, [router, id])

  const loadPessoa = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          *,
          fotos (*),
          videos (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setPessoa(data as PessoaCompleta)
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error)
      setMessage({ type: 'error', text: 'Modelo não encontrado' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!pessoa) return
    
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setPessoa(prev => prev ? { ...prev, [name]: checked } : prev)
    } else if (type === 'number') {
      setPessoa(prev => prev ? { ...prev, [name]: value ? parseInt(value) : null } : prev)
    } else if (name === 'especializacoes') {
      const especialidades = value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      setPessoa(prev => prev ? { ...prev, especializacoes: especialidades } : prev)
    } else {
      setPessoa(prev => prev ? { ...prev, [name]: value } : prev)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pessoa) return
    
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('pessoas')
        .update({
          nome: pessoa.nome,
          descricao: pessoa.descricao,
          altura: pessoa.altura,
          cor_olhos: pessoa.cor_olhos,
          cor_cabelo: pessoa.cor_cabelo,
          medidas_busto: pessoa.medidas_busto,
          medidas_cintura: pessoa.medidas_cintura,
          medidas_quadril: pessoa.medidas_quadril,
          especializacoes: pessoa.especializacoes,
          localizacao: pessoa.localizacao,
          instagram_url: pessoa.instagram_url,
          email: pessoa.email,
          telefone: pessoa.telefone,
          consentimento_contato: pessoa.consentimento_contato,
          parceria: pessoa.parceria,
          data_consentimento: pessoa.consentimento_contato ? pessoa.data_consentimento || new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Modelo atualizado com sucesso!' })
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/admin')
      }, 2000)

    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar modelo' })
    } finally {
      setSaving(false)
    }
  }

  const deleteFoto = async (fotoId: string, caminhoStorage?: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return

    try {
      // Deletar do storage se tiver caminho
      if (caminhoStorage) {
        const fileName = caminhoStorage.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('fotos')
            .remove([fileName])
        }
      }

      // Deletar do banco
      const { error } = await supabase
        .from('fotos')
        .delete()
        .eq('id', fotoId)

      if (error) throw error

      // Atualizar estado local
      setPessoa(prev => prev ? {
        ...prev,
        fotos: prev.fotos.filter(f => f.id !== fotoId)
      } : prev)

      setMessage({ type: 'success', text: 'Foto excluída com sucesso!' })
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
      setMessage({ type: 'error', text: 'Erro ao excluir foto' })
    }
  }

  const deleteVideo = async (videoId: string, caminhoStorage?: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return

    try {
      // Deletar do storage se tiver caminho
      if (caminhoStorage) {
        const fileName = caminhoStorage.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('videos')
            .remove([fileName])
        }
      }

      // Deletar do banco
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      // Atualizar estado local
      setPessoa(prev => prev ? {
        ...prev,
        videos: prev.videos.filter(v => v.id !== videoId)
      } : prev)

      setMessage({ type: 'success', text: 'Vídeo excluído com sucesso!' })
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error)
      setMessage({ type: 'error', text: 'Erro ao excluir vídeo' })
    }
  }

  const setFotoPrincipal = async (fotoId: string, fotoUrl: string) => {
    try {
      // Atualizar todas as fotos para não principal
      await supabase
        .from('fotos')
        .update({ eh_principal: false })
        .eq('pessoa_id', id)

      // Definir a foto selecionada como principal
      await supabase
        .from('fotos')
        .update({ eh_principal: true })
        .eq('id', fotoId)

      // Atualizar na tabela pessoas
      await supabase
        .from('pessoas')
        .update({ foto_principal: fotoUrl })
        .eq('id', id)

      // Atualizar estado local
      setPessoa(prev => prev ? {
        ...prev,
        foto_principal: fotoUrl,
        fotos: prev.fotos.map(f => ({
          ...f,
          eh_principal: f.id === fotoId
        }))
      } : prev)

      setMessage({ type: 'success', text: 'Foto principal atualizada!' })
    } catch (error) {
      console.error('Erro ao definir foto principal:', error)
      setMessage({ type: 'error', text: 'Erro ao definir foto principal' })
    }
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

  if (!pessoa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Modelo não encontrado</h1>
            <button
              onClick={() => router.push('/admin')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Voltar ao painel
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Modelo: {pessoa.nome}
            </h1>
            <button
              onClick={() => router.push('/admin')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Voltar ao painel
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário de dados */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                {/* Nome e altura */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={pessoa.nome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      name="altura"
                      value={pessoa.altura || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={pessoa.descricao || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Características físicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor dos Olhos
                    </label>
                    <input
                      type="text"
                      name="cor_olhos"
                      value={pessoa.cor_olhos || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor do Cabelo
                    </label>
                    <input
                      type="text"
                      name="cor_cabelo"
                      value={pessoa.cor_cabelo || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Medidas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medidas (cm)
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Busto</label>
                      <input
                        type="number"
                        name="medidas_busto"
                        value={pessoa.medidas_busto || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cintura</label>
                      <input
                        type="number"
                        name="medidas_cintura"
                        value={pessoa.medidas_cintura || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quadril</label>
                      <input
                        type="number"
                        name="medidas_quadril"
                        value={pessoa.medidas_quadril || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidades
                  </label>
                  <input
                    type="text"
                    name="especializacoes"
                    value={pessoa.especializacoes?.join(', ') || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Separadas por vírgula"
                  />
                </div>

                {/* Localização */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    value={pessoa.localizacao || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Contato */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="consentimento_contato"
                      checked={pessoa.consentimento_contato}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Consentimento para contato público
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="instagram_url"
                      value={pessoa.instagram_url || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={pessoa.email || ''}
                      onChange={handleInputChange}
                      disabled={!pessoa.consentimento_contato}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={pessoa.telefone || ''}
                      onChange={handleInputChange}
                      disabled={!pessoa.consentimento_contato}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Parceria */}
                <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    name="parceria"
                    checked={pessoa.parceria}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm text-blue-800">
                    Modelo em parceria exclusiva
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </div>

            {/* Galeria de fotos e vídeos */}
            <div className="space-y-6">
              {/* Fotos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fotos ({pessoa.fotos.length})
                </h3>
                
                {pessoa.fotos.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma foto cadastrada</p>
                ) : (
                  <div className="space-y-3">
                    {pessoa.fotos.map((foto) => (
                      <div key={foto.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Image
                          src={foto.url_arquivo}
                          alt="Foto"
                          width={60}
                          height={60}
                          className="w-15 h-15 rounded object-cover"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            {foto.eh_principal && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-x-1">
                          {!foto.eh_principal && (
                            <button
                              onClick={() => setFotoPrincipal(foto.id, foto.url_arquivo)}
                              className="text-blue-600 text-xs hover:text-blue-800"
                            >
                              Definir principal
                            </button>
                          )}
                          <button
                            onClick={() => deleteFoto(foto.id, foto.caminho_storage)}
                            className="text-red-600 text-xs hover:text-red-800"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vídeos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vídeos ({pessoa.videos.length})
                </h3>
                
                {pessoa.videos.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum vídeo cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {pessoa.videos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-15 h-15 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l8-5-8-5z"/>
                            </svg>
                          </div>
                          <div>
                            {video.eh_principal && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteVideo(video.id, video.caminho_storage)}
                          className="text-red-600 text-xs hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}