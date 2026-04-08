'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PessoaCompleta } from '@/types/database'
import Link from 'next/link'

interface CamposVisibilidade {
  mostrar_altura: boolean
  mostrar_medidas: boolean
  mostrar_olhos: boolean
  mostrar_cabelo: boolean
  mostrar_localizacao: boolean
  mostrar_especializacoes: boolean
  mostrar_descricao: boolean
  mostrar_contatos: boolean
}

export default function PupiloPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pupilo, setPupilo] = useState<PessoaCompleta | null>(null)
  const [campos, setCampos] = useState<CamposVisibilidade>({
    mostrar_altura: true,
    mostrar_medidas: true,
    mostrar_olhos: true,
    mostrar_cabelo: true,
    mostrar_localizacao: true,
    mostrar_especializacoes: true,
    mostrar_descricao: true,
    mostrar_contatos: true
  })
  const [currentFoto, setCurrentFoto] = useState(0)
  const [currentVideo, setCurrentVideo] = useState(0)
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos'>('fotos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      loadPupilo(params.id as string)
      loadCamposVisibilidade()
      // Registrar clique/visualização com origem
      const source = searchParams.get('from') || 'direct'
      fetch('/api/analytics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilo_id: params.id, source })
      }).catch(() => {})
    }
  }, [params.id])

  const loadPupilo = async (id: string) => {
    try {
      // Usar API individual segura
      const timestamp = Date.now()
      const response = await fetch(`/api/modelos/${id}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}`)
      }

      const data = await response.json()
      if (!data.success || !data.pupilo) {
        throw new Error('Pupilo não encontrado')
      }
      
      const pupilo = data.pupilo as PessoaCompleta
      
      console.log('✅ Pupilo carregado:', { 
        id: pupilo.id, 
        nome: pupilo.nome, 
        fotos: pupilo.fotos?.length || 0,
        videos: pupilo.videos?.length || 0,
        primeiraFoto: pupilo.fotos?.[0]?.url_arquivo 
      })
      
      setPupilo(pupilo)
    } catch (err: any) {
      console.error('❌ Erro ao carregar pupilo:', err)
      setError(err.message || 'Erro ao carregar pupilo')
    } finally {
      setLoading(false)
    }
  }

  const loadCamposVisibilidade = async () => {
    try {
      const res = await fetch('/api/config/campos-visibilidade')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCampos(data.campos)
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar configurações de visibilidade:', err)
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

  if (error || !pupilo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Pupilo não encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  const fotos = pupilo.fotos || []
  const videos = pupilo.videos || []
  const medidas = [pupilo.medidas_busto, pupilo.medidas_cintura, pupilo.medidas_quadril]
    .filter(Boolean)
    .join(' — ')

  const nextFoto = () => setCurrentFoto((prev) => (prev + 1) % fotos.length)
  const prevFoto = () => setCurrentFoto((prev) => (prev - 1 + fotos.length) % fotos.length)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight uppercase">
            Pupilos da Lani
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-white transition-colors uppercase tracking-wide"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black uppercase tracking-tight mb-2">
            {pupilo.nome}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {campos.mostrar_localizacao && pupilo.localizacao && (
              <span>📍 {pupilo.localizacao}</span>
            )}
            <span>📷 {fotos.length} foto{fotos.length !== 1 ? 's' : ''}</span>
            {videos.length > 0 && (
              <span>🎥 {videos.length} vídeo{videos.length !== 1 ? 's' : ''}</span>
            )}
            {pupilo.destaque && (
              <span className="bg-black text-white px-2 py-1 text-xs uppercase tracking-wide">
                Destaque
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Media Column */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('fotos')}
                className={`px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors ${
                  activeTab === 'fotos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Fotos ({fotos.length})
              </button>
              {videos.length > 0 && (
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors ${
                    activeTab === 'videos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Vídeos ({videos.length})
                </button>
              )}
            </div>

            {/* Content */}
            {activeTab === 'fotos' && fotos.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative aspect-[4/5] bg-gray-50 mb-6">
                  <img
                    src={fotos[currentFoto].url_arquivo}
                    alt={`${pupilo.nome} - ${currentFoto + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y5ZmFmYiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm8gYW8gY2FycmVnYXI8L3RleHQ+Cjwvc3ZnPg=='
                    }}
                    onLoad={() => console.log('Imagem carregada:', fotos[currentFoto].url_arquivo)}
                  />
                  {fotos.length > 1 && (
                    <>
                      <button
                        onClick={prevFoto}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-colors text-xl font-bold shadow-lg"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextFoto}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-colors text-xl font-bold shadow-lg"
                      >
                        ›
                      </button>
                    </>
                  )}
                  <div className="absolute top-4 right-4 text-sm text-gray-600 bg-white/90 px-3 py-1 shadow-lg">
                    {currentFoto + 1} / {fotos.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {fotos.length > 1 && (
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
                    {fotos.map((foto, index) => (
                      <button
                        key={foto.id}
                        onClick={() => setCurrentFoto(index)}
                        className={`relative aspect-square overflow-hidden ${
                          index === currentFoto ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                        } transition-all`}
                      >
                        <img
                          src={foto.url_arquivo}
                          alt={`${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === 'videos' && videos.length > 0 ? (
              <div className="space-y-6">
                {videos.map((video, index) => (
                  <div key={video.id} className="relative bg-black">
                    <video
                      src={video.url_arquivo}
                      controls
                      className="w-full"
                      preload="metadata"
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Vídeo {index + 1} de {videos.length}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-lg tracking-widest uppercase">
                  {activeTab === 'fotos' ? 'Sem fotos' : 'Sem vídeos'}
                </p>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-8">
            {/* Physical Details */}
            {(campos.mostrar_altura || campos.mostrar_medidas || campos.mostrar_olhos || campos.mostrar_cabelo) && (
              <div>
                <h3 className="text-lg font-bold tracking-tight uppercase text-black mb-4">
                  Características
                </h3>
                <div className="space-y-3 text-sm">
                  {campos.mostrar_altura && pupilo.altura && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Altura</span>
                      <span className="font-medium">{pupilo.altura}cm</span>
                    </div>
                  )}
                  {campos.mostrar_medidas && medidas && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Medidas</span>
                      <span className="font-medium">{medidas}</span>
                    </div>
                  )}
                  {campos.mostrar_olhos && pupilo.cor_olhos && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Olhos</span>
                      <span className="font-medium">{pupilo.cor_olhos}</span>
                    </div>
                  )}
                  {campos.mostrar_cabelo && pupilo.cor_cabelo && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Cabelo</span>
                      <span className="font-medium">{pupilo.cor_cabelo}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specializations */}
            {campos.mostrar_especializacoes && pupilo.especializacoes && pupilo.especializacoes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold tracking-tight uppercase text-black mb-4">
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pupilo.especializacoes.map((esp, index) => (
                    <span
                      key={index}
                      className="text-sm text-gray-600 border border-gray-300 px-3 py-2"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {campos.mostrar_descricao && pupilo.descricao && (
              <div>
                <h3 className="text-lg font-bold tracking-tight uppercase text-black mb-4">
                  Sobre
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {pupilo.descricao}
                </p>
              </div>
            )}

            {/* Portfolio Stats */}
            <div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-black mb-4">
                Portfolio
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Fotos</span>
                  <span className="font-medium">{fotos.length}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Vídeos</span>
                  <span className="font-medium">{videos.length}</span>
                </div>
                {pupilo.destaque && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium">Destaque</span>
                  </div>
                )}
                {pupilo.parceria && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Parceria</span>
                    <span className="font-medium">Exclusiva</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Buttons */}
            {campos.mostrar_contatos && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-tight uppercase text-black mb-4">
                  Contato
                </h3>
                {pupilo.instagram_url && (
                  <a
                    href={pupilo.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-black text-white text-center py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {pupilo.telefone && pupilo.consentimento_contato && (
                  <a
                    href={`https://wa.me/${pupilo.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white text-center py-4 text-sm font-semibold tracking-widest uppercase hover:bg-green-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
                {pupilo.email && pupilo.consentimento_contato && (
                  <a
                    href={`mailto:${pupilo.email}`}
                    className="block w-full bg-white text-black text-center py-4 text-sm font-semibold tracking-widest uppercase border border-gray-300 hover:border-black transition-colors"
                  >
                    Email
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}