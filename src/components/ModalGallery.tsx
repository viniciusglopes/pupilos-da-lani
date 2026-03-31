'use client'

import { useState } from 'react'
import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'

interface ModalGalleryProps {
  pessoa: PessoaCompleta
  isOpen: boolean
  onClose: () => void
}

export default function ModalGallery({ pessoa, isOpen, onClose }: ModalGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos'>('fotos')

  if (!isOpen) return null

  const fotos = pessoa.fotos || []
  const videos = pessoa.videos || []
  const currentFoto = fotos[currentIndex]

  const nextPhoto = () => setCurrentIndex((prev) => (prev + 1) % fotos.length)
  const prevPhoto = () => setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length)

  const medidas = [pessoa.medidas_busto, pessoa.medidas_cintura, pessoa.medidas_quadril]
    .filter(Boolean)
    .join(' — ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Mobile: Stack vertical, Desktop: Sidebar layout */}
      <div className="relative z-10 w-full max-w-6xl mx-2 sm:mx-4 bg-white overflow-hidden max-h-[98vh] sm:max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase">{pessoa.nome}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
              {videos.length > 0 && ` — ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
              {pessoa.localizacao && ` — ${pessoa.localizacao}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {/* Tabs if videos exist */}
        {videos.length > 0 && (
          <div className="flex border-b border-gray-200 shrink-0">
            <button
              onClick={() => setActiveTab('fotos')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                activeTab === 'fotos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Fotos ({fotos.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                activeTab === 'videos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Videos ({videos.length})
            </button>
          </div>
        )}

        {/* Mobile: Stack layout, Desktop: Flex layout */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Main content area */}
          <div className="flex-1 relative bg-gray-50 flex items-center justify-center min-h-[250px] sm:min-h-[400px]">
            {activeTab === 'fotos' ? (
              fotos.length > 0 ? (
                <>
                  <Image
                    src={currentFoto.url_arquivo}
                    alt={`${pessoa.nome} - ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', currentFoto.url_arquivo)
                    }}
                  />
                  {fotos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-colors text-lg sm:text-xl font-bold shadow-sm"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-colors text-lg sm:text-xl font-bold shadow-sm"
                      >
                        ›
                      </button>
                    </>
                  )}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-xs text-gray-600 bg-white/90 px-2 sm:px-3 py-1 shadow-sm">
                    {currentIndex + 1} / {fotos.length}
                  </div>
                  
                  {/* Mobile: Navigation dots */}
                  {fotos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
                      {fotos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-sm tracking-widest uppercase">Sem fotos</p>
              )
            ) : (
              // Videos tab
              videos.length > 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 sm:p-6 overflow-y-auto">
                  {videos.map((video, index) => (
                    <div key={video.id} className="w-full max-w-2xl">
                      <video
                        src={video.url_arquivo}
                        controls
                        className="w-full bg-black"
                        preload="metadata"
                        onError={(e) => {
                          console.error('Erro ao carregar video:', video.url_arquivo)
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Video {index + 1} de {videos.length}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm tracking-widest uppercase">Sem videos</p>
              )
            )}
          </div>

          {/* Sidebar/Bottom panel with ALL data */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 overflow-y-auto shrink-0 max-h-[350px] lg:max-h-none">
            {/* Photo thumbnails - Enhanced for mobile */}
            {activeTab === 'fotos' && fotos.length > 1 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Todas as Fotos</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-1.5">
                  {fotos.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative aspect-square overflow-hidden ${
                        index === currentIndex ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                      } transition-all duration-200`}
                    >
                      <Image
                        src={foto.url_arquivo}
                        alt={`${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 20vw, (max-width: 1024px) 15vw, 80px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Physical details */}
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Detalhes</h3>
                <div className="space-y-2 text-sm">
                  {pessoa.altura && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Altura</span>
                      <span className="font-medium">{pessoa.altura}cm</span>
                    </div>
                  )}
                  {medidas && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Medidas</span>
                      <span className="font-medium">{medidas}</span>
                    </div>
                  )}
                  {pessoa.cor_olhos && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Olhos</span>
                      <span className="font-medium">{pessoa.cor_olhos}</span>
                    </div>
                  )}
                  {pessoa.cor_cabelo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cabelo</span>
                      <span className="font-medium">{pessoa.cor_cabelo}</span>
                    </div>
                  )}
                  {pessoa.localizacao && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Local</span>
                      <span className="font-medium">{pessoa.localizacao}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specializations */}
              {pessoa.especializacoes && pessoa.especializacoes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {pessoa.especializacoes.map((esp, index) => (
                      <span
                        key={index}
                        className="text-xs text-gray-600 border border-gray-300 px-3 py-1"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {pessoa.descricao && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Sobre</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{pessoa.descricao}</p>
                </div>
              )}

              {/* Media stats */}
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Portfolio</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fotos</span>
                    <span className="font-medium">{fotos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Videos</span>
                    <span className="font-medium">{videos.length}</span>
                  </div>
                  {pessoa.destaque && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium">Destaque</span>
                    </div>
                  )}
                  {pessoa.parceria && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Parceria</span>
                      <span className="font-medium">Sim</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact buttons - Optimized for mobile */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {pessoa.instagram_url && (
                  <a
                    href={pessoa.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-black text-white text-center py-3 text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {pessoa.telefone && pessoa.consentimento_contato && (
                  <a
                    href={`https://wa.me/${pessoa.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white text-center py-3 text-xs font-semibold tracking-widest uppercase hover:bg-green-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
                {pessoa.email && pessoa.consentimento_contato && (
                  <a
                    href={`mailto:${pessoa.email}`}
                    className="block w-full bg-white text-black text-center py-3 text-xs font-semibold tracking-widest uppercase border border-gray-300 hover:border-black transition-colors"
                  >
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
