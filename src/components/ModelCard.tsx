'use client'

import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ModalGallery from './ModalGallery'

interface ModelCardProps {
  pessoa: PessoaCompleta
  isParceiro?: boolean
}

export default function ModelCard({ pessoa, isParceiro = false }: ModelCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Auto-rotate photos every 5 seconds
  useEffect(() => {
    if (pessoa.fotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex(prev => (prev + 1) % pessoa.fotos.length)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [pessoa.fotos.length])

  const fotoUrl = pessoa.fotos.length > 0 
    ? pessoa.fotos[currentPhotoIndex]?.url_arquivo
    : pessoa.foto_principal

  return (
    <>
      <div
        className="group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {fotoUrl ? (
            <Image
              src={fotoUrl}
              alt={pessoa.nome}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <span className="text-gray-300 text-sm tracking-widest uppercase">Sem foto</span>
            </div>
          )}

          {/* Minimal overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

          {/* Bottom info overlay on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-3">
              {pessoa.instagram_url && (
                <a
                  href={pessoa.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/80 hover:text-white transition-colors uppercase tracking-wider"
                  onClick={(e) => e.stopPropagation()}
                >
                  Instagram
                </a>
              )}
              {pessoa.telefone && pessoa.consentimento_contato && (
                <a
                  href={`https://wa.me/${pessoa.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/80 hover:text-white transition-colors uppercase tracking-wider"
                  onClick={(e) => e.stopPropagation()}
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 pb-6">
          <h3 className="text-sm font-semibold text-black tracking-wide uppercase">
            {pessoa.nome}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {pessoa.localizacao && <span>{pessoa.localizacao}</span>}
            {pessoa.altura && <span>{pessoa.altura}cm</span>}
          </div>
        </div>
      </div>

      <ModalGallery
        pessoa={pessoa}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
