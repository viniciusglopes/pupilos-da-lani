'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'
import { PessoaForm } from '@/types/database'

export default function CadastroPage() {
  const [loading, setLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [fotos, setFotos] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [formData, setFormData] = useState<PessoaForm>({
    nome: '',
    descricao: '',
    altura: undefined,
    idade: undefined,
    cor_olhos: '',
    cor_cabelo: '',
    medidas_busto: undefined,
    medidas_cintura: undefined,
    medidas_quadril: undefined,
    especializacoes: [],
    localizacao: '',
    instagram_url: '',
    email: '',
    telefone: '',
    consentimento_contato: false,
    parceria: false,
    destaque: false
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }))
    } else if (name === 'especializacoes') {
      const especialidades = value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      setFormData(prev => ({ ...prev, especializacoes: especialidades }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'fotos' | 'videos') => {
    const files = Array.from(e.target.files || [])
    
    if (type === 'fotos') {
      const validImages = files.filter(file => file.type.startsWith('image/'))
      if (validImages.length !== files.length) {
        setMessage({ type: 'error', text: 'Apenas arquivos de imagem sao permitidos para fotos' })
        return
      }
      setFotos(validImages)
    } else {
      const validVideos = files.filter(file => file.type.startsWith('video/'))
      if (validVideos.length !== files.length) {
        setMessage({ type: 'error', text: 'Apenas arquivos de video sao permitidos' })
        return
      }
      setVideos(validVideos)
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token')
    return { 'Authorization': `Bearer ${token}` }
  }

  const uploadFileViaAPI = async (file: File, type: 'foto' | 'video', pessoaId: string, eh_principal: boolean = false, ordem: number = 0): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('pessoa_id', pessoaId)
    formData.append('type', type)
    formData.append('eh_principal', String(eh_principal))
    formData.append('ordem', String(ordem))

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const result = await response.json()
      console.error(`Erro upload ${type}:`, result.error)
      return null
    }

    const result = await response.json()
    return result.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (!formData.nome.trim()) {
        throw new Error('Nome e obrigatorio')
      }

      if (formData.email && !formData.consentimento_contato) {
        throw new Error('Para cadastrar email, e necessario consentimento de contato')
      }

      if (formData.telefone && !formData.consentimento_contato) {
        throw new Error('Para cadastrar telefone, e necessario consentimento de contato')
      }

      const response = await fetch('/api/modelos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar pupilo')
      }

      const pessoa = result.pessoa

      setUploadingFiles(true)

      let fotoPrincipal: string | null = null
      for (let i = 0; i < fotos.length; i++) {
        const fotoUrl = await uploadFileViaAPI(fotos[i], 'foto', pessoa.id, i === 0, i)
        if (fotoUrl && i === 0) fotoPrincipal = fotoUrl
      }

      let videoPrincipal: string | null = null
      for (let i = 0; i < videos.length; i++) {
        const videoUrl = await uploadFileViaAPI(videos[i], 'video', pessoa.id, i === 0, i)
        if (videoUrl && i === 0) videoPrincipal = videoUrl
      }

      if (fotoPrincipal || videoPrincipal) {
        await fetch(`/api/modelos/${pessoa.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            foto_principal: fotoPrincipal,
            video_principal: videoPrincipal
          })
        })
      }

      setMessage({ type: 'success', text: result.message || `Pupilo "${pessoa.nome}" cadastrado com sucesso!` })
      
      setFormData({
        nome: '',
        descricao: '',
        altura: undefined,
        idade: undefined,
        cor_olhos: '',
        cor_cabelo: '',
        medidas_busto: undefined,
        medidas_cintura: undefined,
        medidas_quadril: undefined,
        especializacoes: [],
        localizacao: '',
        instagram_url: '',
        email: '',
        telefone: '',
        consentimento_contato: false,
        parceria: false,
        destaque: false
      })
      setFotos([])
      setVideos([])

      // Stay on the same page — don't redirect

    } catch (error: any) {
      console.error('Erro cadastro:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao cadastrar pupilo' })
    } finally {
      setLoading(false)
      setUploadingFiles(false)
    }
  }

  const especialidadesComuns = [
    'Fashion', 'Editorial', 'Comercial', 'Fitness', 'Plus Size',
    'Infantil', 'Teen', 'Senior', 'Lingerie', 'Casual', 'Festa'
  ]

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-4xl mx-auto">
        <div className="max-w-2xl mx-auto border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2 uppercase tracking-wide">
              Cadastro de Pupilo
            </h1>
            <p className="text-gray-500 text-sm">
              Adicione um novo pupilo ao portfolio
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome (campo expandido) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-lg"
                required
                placeholder="Digite o nome completo do pupilo"
              />
            </div>

            {/* Informacoes Basicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  name="altura"
                  value={formData.altura || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  name="idade"
                  value={formData.idade || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  min="16"
                  max="65"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                Descricao
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Breve descricao profissional..."
              />
            </div>

            {/* Caracteristicas Fisicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  Cor dos Olhos
                </label>
                <select
                  name="cor_olhos"
                  value={formData.cor_olhos}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Selecione...</option>
                  <option value="Castanhos">Castanhos</option>
                  <option value="Azuis">Azuis</option>
                  <option value="Verdes">Verdes</option>
                  <option value="Pretos">Pretos</option>
                  <option value="Mel">Mel</option>
                  <option value="Avela">Avela</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  Cor do Cabelo
                </label>
                <select
                  name="cor_cabelo"
                  value={formData.cor_cabelo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Selecione...</option>
                  <option value="Preto">Preto</option>
                  <option value="Castanho">Castanho</option>
                  <option value="Loiro">Loiro</option>
                  <option value="Ruivo">Ruivo</option>
                  <option value="Grisalho">Grisalho</option>
                  <option value="Colorido">Colorido</option>
                </select>
              </div>
            </div>

            {/* Medidas */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-3 uppercase tracking-widest">
                Medidas (cm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Busto</label>
                  <input
                    type="number"
                    name="medidas_busto"
                    value={formData.medidas_busto || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    min="60"
                    max="150"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cintura</label>
                  <input
                    type="number"
                    name="medidas_cintura"
                    value={formData.medidas_cintura || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    min="50"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quadril</label>
                  <input
                    type="number"
                    name="medidas_quadril"
                    value={formData.medidas_quadril || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    min="70"
                    max="150"
                  />
                </div>
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                Especialidades
              </label>
              <input
                type="text"
                name="especializacoes"
                value={formData.especializacoes?.join(', ') || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: Fashion, Editorial, Comercial (separadas por virgula)"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {especialidadesComuns.map(esp => (
                  <button
                    key={esp}
                    type="button"
                    onClick={() => {
                      const current = formData.especializacoes || []
                      if (current.includes(esp)) {
                        setFormData(prev => ({ 
                          ...prev, 
                          especializacoes: current.filter(e => e !== esp) 
                        }))
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          especializacoes: [...current, esp] 
                        }))
                      }
                    }}
                    className={`px-2 py-1 text-xs transition-colors ${
                      formData.especializacoes?.includes(esp)
                        ? 'bg-black text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {esp}
                  </button>
                ))}
              </div>
            </div>

            {/* Localizacao */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                Localizacao
              </label>
              <input
                type="text"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: Belo Horizonte, MG"
              />
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-black uppercase tracking-wide">Informacoes de Contato</h3>
              
              <div className="border border-gray-300 p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="consentimento_contato"
                    checked={formData.consentimento_contato}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <label className="text-sm text-gray-700">
                    <strong>Consentimento LGPD:</strong> Autorizo o uso dos dados de contato abaixo 
                    para comunicacao profissional e exibicao publica no portal.
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://instagram.com/usuario"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!formData.consentimento_contato}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  WhatsApp (opcional)
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  disabled={!formData.consentimento_contato}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                  placeholder="5531999999999"
                />
              </div>
            </div>

            {/* Parceria */}
            <div className="border border-gray-300 p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="parceria"
                  checked={formData.parceria}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <label className="text-sm text-gray-700">
                  <strong>Pupilo Parceiro:</strong> Marcar como pupilo em parceria exclusiva
                </label>
              </div>
            </div>

            {/* Destaque */}
            <div className="border border-gray-300 p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="destaque"
                  checked={formData.destaque || false}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <label className="text-sm text-gray-700">
                  <strong>Pupilo Destaque:</strong> Exibir na area de destaques da tela principal
                </label>
              </div>
            </div>

            {/* Upload Arquivos */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-black uppercase tracking-wide">Portfolio</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  Fotos (maximo 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'fotos')}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {fotos.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {fotos.length} foto(s) selecionada(s)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                  Videos (maximo 5)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'videos')}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {videos.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {videos.length} video(s) selecionado(s)
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="w-full bg-black text-white py-3 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {loading ? (
                uploadingFiles ? 'Fazendo upload dos arquivos...' : 'Cadastrando...'
              ) : (
                'Cadastrar Pupilo'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin')}
              className="text-black hover:text-gray-600 font-medium text-sm underline"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
