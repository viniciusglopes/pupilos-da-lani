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

  if (!isOpen) return null

  const fotos = pessoa.fotos || []
  const currentFoto = fotos[currentIndex]

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % fotos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">📸</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{pessoa.nome}</h2>
              <p className="text-purple-100">
                {fotos.length} foto{fotos.length !== 1 ? 's' : ''} • {pessoa.localizacao}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {fotos.length > 0 ? (
          <div className="flex h-[70vh]">
            {/* Main Photo */}
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
              <Image
                src={currentFoto.url_arquivo}
                alt={`${pessoa.nome} - Foto ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 70vw"
              />
              
              {/* Navigation Arrows */}
              {fotos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                  >
                    →
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {currentIndex + 1} de {fotos.length}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
              {/* Thumbnails */}
              {fotos.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Galeria</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {fotos.map((foto, index) => (
                      <button
                        key={foto.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          index === currentIndex ? 'ring-2 ring-purple-600' : ''
                        }`}
                      >
                        <Image
                          src={foto.url_arquivo}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informações</h3>
                  <div className="space-y-3 text-sm">
                    {pessoa.altura && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Altura:</span>
                        <span className="font-medium">{pessoa.altura}cm</span>
                      </div>
                    )}
                    {pessoa.localizacao && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Local:</span>
                        <span className="font-medium">{pessoa.localizacao}</span>
                      </div>
                    )}
                    {pessoa.especializacoes && pessoa.especializacoes.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-2">Especialidades:</span>
                        <div className="flex flex-wrap gap-1">
                          {pessoa.especializacoes.map((esp, index) => (
                            <span 
                              key={index}
                              className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                            >
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {pessoa.descricao && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sobre</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{pessoa.descricao}</p>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-3 pt-4 border-t">
                  {pessoa.instagram_url && (
                    <a
                      href={pessoa.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      📷 Ver Instagram
                    </a>
                  )}
                  
                  {pessoa.telefone && pessoa.consentimento_contato && (
                    <a
                      href={`https://wa.me/${pessoa.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-lg font-semibold mb-2">Sem fotos disponíveis</h3>
              <p className="text-sm">Este modelo ainda não possui fotos cadastradas.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Portfolio de {pessoa.nome}
          </div>
          
          {fotos.length > 1 && (
            <div className="flex space-x-2">
              <button
                onClick={prevPhoto}
                className="bg-white text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={nextPhoto}
                className="bg-white text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}