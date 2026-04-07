'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta, Foto, Video } from '@/types/database'
import AdminSidebar from '@/components/AdminSidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function EditModelPage() {
  const [pessoa, setPessoa] = useState<PessoaCompleta | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [novasFotos, setNovasFotos] = useState<File[]>([])
  const [novosVideos, setNovosVideos] = useState<File[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
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
      setMessage({ type: 'error', text: 'Pupilo nao encontrado' })
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token')
    return { 'Authorization': `Bearer ${token}` }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pessoa) return

    setSaving(true)
    setMessage(null)

    try {
      // Usar API ao invés de client-side Supabase
      const response = await fetch(`/api/modelos/${pessoa.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          nome: pessoa.nome,
          descricao: pessoa.descricao,
          altura: pessoa.altura,
          idade: pessoa.idade,
          sexo: pessoa.sexo,
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
          destaque: pessoa.destaque,
          data_consentimento: pessoa.consentimento_contato ? pessoa.data_consentimento || new Date().toISOString() : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar pupilo')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Erro na resposta da API')
      }

      setMessage({ type: 'success', text: 'Pupilo atualizado com sucesso!' })
      
      // Recarregar dados atualizados
      setTimeout(async () => {
        await loadPessoa()
        setMessage(null)
      }, 2000)

    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar pupilo' })
    } finally {
      setSaving(false)
    }
  }

  const deleteFoto = async (fotoId: string, caminhoStorage?: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return

    try {
      if (caminhoStorage) {
        const fileName = caminhoStorage.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('fotos')
            .remove([fileName])
        }
      }

      const { error } = await supabase
        .from('fotos')
        .delete()
        .eq('id', fotoId)

      if (error) throw error

      setPessoa(prev => prev ? {
        ...prev,
        fotos: prev.fotos.filter(f => f.id !== fotoId)
      } : prev)

      setMessage({ type: 'success', text: 'Foto excluida com sucesso!' })
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
      setMessage({ type: 'error', text: 'Erro ao excluir foto' })
    }
  }

  const deleteVideo = async (videoId: string, caminhoStorage?: string) => {
    if (!confirm('Tem certeza que deseja excluir este video?')) return

    try {
      if (caminhoStorage) {
        const fileName = caminhoStorage.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('videos')
            .remove([fileName])
        }
      }

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      setPessoa(prev => prev ? {
        ...prev,
        videos: prev.videos.filter(v => v.id !== videoId)
      } : prev)

      setMessage({ type: 'success', text: 'Video excluido com sucesso!' })
    } catch (error) {
      console.error('Erro ao deletar video:', error)
      setMessage({ type: 'error', text: 'Erro ao excluir video' })
    }
  }

  const setFotoPrincipal = async (fotoId: string, fotoUrl: string) => {
    try {
      await supabase
        .from('fotos')
        .update({ eh_principal: false })
        .eq('pessoa_id', id)

      await supabase
        .from('fotos')
        .update({ eh_principal: true })
        .eq('id', fotoId)

      await supabase
        .from('pessoas')
        .update({ foto_principal: fotoUrl })
        .eq('id', id)

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

  const uploadArquivoViaAPI = async (arquivo: File, type: 'foto' | 'video', eh_principal: boolean = false, ordem: number = 999): Promise<boolean> => {
    const formData = new FormData()
    formData.append('file', arquivo)
    formData.append('pessoa_id', id)
    formData.append('type', type)
    formData.append('eh_principal', String(eh_principal))
    formData.append('ordem', String(ordem))

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Erro no upload')
    }

    return true
  }

  const handleNovasFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files)
      setNovasFotos(prev => [...prev, ...arquivos])
    }
  }

  const removerNovaFoto = (index: number) => {
    setNovasFotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleNovosVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files).filter(f => f.type.startsWith('video/'))
      setNovosVideos(prev => [...prev, ...arquivos])
    }
  }

  const removerNovoVideo = (index: number) => {
    setNovosVideos(prev => prev.filter((_, i) => i !== index))
  }

  const uploadNovasFotos = async () => {
    if (novasFotos.length === 0) return

    setUploadingFiles(true)
    setMessage(null)

    try {
      for (const foto of novasFotos) {
        await uploadArquivoViaAPI(foto, 'foto')
      }

      await loadPessoa()
      setNovasFotos([])
      setMessage({ type: 'success', text: `${novasFotos.length} foto(s) adicionada(s) com sucesso!` })

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      setMessage({ type: 'error', text: 'Erro ao fazer upload das fotos' })
    } finally {
      setUploadingFiles(false)
    }
  }

  const uploadNovosVideos = async () => {
    if (novosVideos.length === 0) return

    setUploadingFiles(true)
    setMessage(null)

    try {
      for (const video of novosVideos) {
        await uploadArquivoViaAPI(video, 'video')
      }

      await loadPessoa()
      setNovosVideos([])
      setMessage({ type: 'success', text: `${novosVideos.length} video(s) adicionado(s) com sucesso!` })

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      setMessage({ type: 'error', text: 'Erro ao fazer upload dos videos' })
    } finally {
      setUploadingFiles(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm uppercase tracking-wide">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!pessoa) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4 uppercase tracking-wide">Pupilo nao encontrado</h1>
            <button
              onClick={() => router.push('/admin')}
              className="text-black hover:text-gray-600 underline"
            >
              Voltar ao painel
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
              Editar: {pessoa.nome}
            </h1>
            <button
              onClick={() => router.push('/admin')}
              className="text-black hover:text-gray-600 font-medium text-sm underline"
            >
              Voltar ao painel
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 border ${
              message.type === 'success' 
                ? 'border-gray-300 text-gray-700'
                : 'border-gray-300 text-gray-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de dados */}
            <div className="lg:col-span-2 border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-black mb-6 uppercase tracking-widest">Informacoes Basicas</h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                {/* Nome e detalhes básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={pessoa.nome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Sexo
                    </label>
                    <select
                      name="sexo"
                      value={pessoa.sexo || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Selecione...</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                    </select>
                  </div>
                </div>

                {/* Altura e idade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      name="altura"
                      value={pessoa.altura || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Idade
                    </label>
                    <input
                      type="number"
                      name="idade"
                      value={pessoa.idade || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Descricao */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                    Descricao
                  </label>
                  <textarea
                    name="descricao"
                    value={pessoa.descricao || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Caracteristicas fisicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Cor dos Olhos
                    </label>
                    <input
                      type="text"
                      name="cor_olhos"
                      value={pessoa.cor_olhos || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Cor do Cabelo
                    </label>
                    <input
                      type="text"
                      name="cor_cabelo"
                      value={pessoa.cor_cabelo || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Medidas */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
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
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cintura</label>
                      <input
                        type="number"
                        name="medidas_cintura"
                        value={pessoa.medidas_cintura || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quadril</label>
                      <input
                        type="number"
                        name="medidas_quadril"
                        value={pessoa.medidas_quadril || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                    Especialidades
                  </label>
                  <input
                    type="text"
                    name="especializacoes"
                    value={pessoa.especializacoes?.join(', ') || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Separadas por virgula"
                  />
                </div>

                {/* Localizacao */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                    Localizacao
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    value={pessoa.localizacao || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
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
                      Consentimento para contato publico
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="instagram_url"
                      value={pessoa.instagram_url || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={pessoa.email || ''}
                      onChange={handleInputChange}
                      disabled={!pessoa.consentimento_contato}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-widest">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={pessoa.telefone || ''}
                      onChange={handleInputChange}
                      disabled={!pessoa.consentimento_contato}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Parceria */}
                <div className="flex items-center border border-gray-300 p-3">
                  <input
                    type="checkbox"
                    name="parceria"
                    checked={pessoa.parceria}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Pupilo em parceria exclusiva
                  </label>
                </div>

                {/* Destaque */}
                <div className="flex items-center border border-gray-300 p-3">
                  <input
                    type="checkbox"
                    name="destaque"
                    checked={pessoa.destaque || false}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    <strong>Pupilo Destaque:</strong> Exibir na area de destaques da tela principal
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-black text-white py-3 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 uppercase tracking-widest text-sm"
                >
                  {saving ? 'Salvando...' : 'Salvar Alteracoes'}
                </button>
              </form>
            </div>

            {/* Galeria de fotos e videos */}
            <div className="space-y-6">
              {/* Fotos */}
              <div className="border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-black uppercase tracking-widest">
                  Fotos ({pessoa.fotos.length})
                </h3>
                <span className="text-xs text-gray-400">
                  Passe o mouse para ver opcoes
                </span>
              </div>
                
                {pessoa.fotos.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma foto cadastrada</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pessoa.fotos.map((foto) => (
                      <div key={foto.id} className="relative group">
                        <Image
                          src={foto.url_arquivo}
                          alt="Foto"
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        
                        {/* Overlay com controles */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center space-y-2">
                            {foto.eh_principal && (
                              <span className="border border-white text-white px-2 py-1 text-xs font-medium">
                                Foto Principal
                              </span>
                            )}
                            
                            <div className="space-x-2">
                              {!foto.eh_principal && (
                                <button
                                  onClick={() => setFotoPrincipal(foto.id, foto.url_arquivo)}
                                  className="bg-white text-black px-3 py-1 text-sm hover:bg-gray-100 transition-colors"
                                >
                                  Definir Principal
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteFoto(foto.id, foto.caminho_storage)}
                                className="bg-white text-black px-3 py-1 text-sm hover:bg-gray-100 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload de novas fotos */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-semibold text-black mb-3 uppercase tracking-widest">
                    Adicionar Novas Fotos
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNovasFotos}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Selecione multiplas fotos (JPEG, PNG, etc.)
                      </p>
                    </div>

                    {novasFotos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Fotos selecionadas ({novasFotos.length}):
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {novasFotos.map((foto, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2">
                              <span className="text-sm text-gray-700 truncate">
                                {foto.name}
                              </span>
                              <button
                                onClick={() => removerNovaFoto(index)}
                                className="text-gray-600 text-sm hover:text-black"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {novasFotos.length > 0 && (
                      <button
                        onClick={uploadNovasFotos}
                        disabled={uploadingFiles}
                        className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
                      >
                        {uploadingFiles ? 'Fazendo upload...' : `Adicionar ${novasFotos.length} foto(s)`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Videos */}
              <div className="border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest">
                  Videos ({pessoa.videos.length})
                </h3>
                
                {pessoa.videos.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum video cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {pessoa.videos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-3 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-15 h-15 bg-gray-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l8-5-8-5z"/>
                            </svg>
                          </div>
                          <div>
                            {video.eh_principal && (
                              <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteVideo(video.id, video.caminho_storage)}
                          className="text-gray-600 text-xs hover:text-black"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload de novos videos */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-semibold text-black mb-3 uppercase tracking-widest">
                    Adicionar Novos Videos
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleNovosVideos}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Selecione multiplos videos (MP4, MOV, etc.)
                      </p>
                    </div>

                    {novosVideos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Videos selecionados ({novosVideos.length}):
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {novosVideos.map((video, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2">
                              <span className="text-sm text-gray-700 truncate">
                                {video.name}
                              </span>
                              <button
                                onClick={() => removerNovoVideo(index)}
                                className="text-gray-600 text-sm hover:text-black"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {novosVideos.length > 0 && (
                      <button
                        onClick={uploadNovosVideos}
                        disabled={uploadingFiles}
                        className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
                      >
                        {uploadingFiles ? 'Fazendo upload...' : `Adicionar ${novosVideos.length} video(s)`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
