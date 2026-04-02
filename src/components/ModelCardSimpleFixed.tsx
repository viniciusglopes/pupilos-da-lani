'use client'

import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ModelCardProps {
  pessoa: PessoaCompleta
  isParceiro?: boolean
}

export default function ModelCardSimpleFixed({ pessoa, isParceiro = false }: ModelCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Auto-rotate photos every 5 seconds
  useEffect(() => {
    if (pessoa.fotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex(prev => (prev + 1) % pessoa.fotos.length)
        setImageLoaded(false) // Reset load state on image change
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [pessoa.fotos.length])

  const fotoUrl = pessoa.fotos.length > 0 
    ? pessoa.fotos[currentPhotoIndex]?.url_arquivo
    : pessoa.foto_principal

  // Cache bust URL - força reload da imagem
  const cacheBustUrl = fotoUrl ? `${fotoUrl}?v=${Date.now()}` : null

  return (
    <Link
      href={`/pupilos/${pessoa.id}`}
      className="group cursor-pointer block"
    >
      {/* Container da imagem - ALTURA FIXA GARANTIDA */}
      <div 
        className="relative overflow-hidden bg-gray-100 border border-gray-200"
        style={{ 
          width: '100%', 
          height: '160px',
          minHeight: '160px', // GARANTIR altura mínima
          maxHeight: '160px'  // GARANTIR altura máxima
        }}
      >
        {cacheBustUrl && !imageError ? (
          <Image
            src={cacheBustUrl}
            alt={pessoa.nome}
            fill
            style={{ 
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none' // Só mostrar quando carregada
            }}
            className="transition-transform duration-700 group-hover:scale-105"
            sizes="160px"
            quality={70}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error('Erro ao carregar imagem:', cacheBustUrl)
              setImageError(true)
            }}
            priority={currentPhotoIndex === 0} // Prioridade para primeira foto
          />
        ) : null}

        {/* Loading placeholder */}
        {!imageLoaded && !imageError && cacheBustUrl && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs tracking-widest uppercase"
          >
            Carregando...
          </div>
        )}

        {/* Fallback sem foto */}
        {(!cacheBustUrl || imageError) && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300 text-xs tracking-widest uppercase"
          >
            {imageError ? 'Erro na imagem' : 'Sem foto'}
          </div>
        )}

        {/* Overlay hover - só quando imagem carregou */}
        {imageLoaded && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
        )}

        {/* Info overlay */}
        {imageLoaded && (
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
            <span className="text-xs text-white/80 uppercase tracking-wider">
              Ver Perfil
            </span>
          </div>
        )}
      </div>

      {/* Info abaixo da imagem */}
      <div className="pt-2 pb-3">
        <h3 className="text-xs font-semibold text-black tracking-wide uppercase truncate">
          {pessoa.nome}
        </h3>
        <div className="mt-1 text-xs text-gray-500">
          {pessoa.idade ? `${pessoa.idade} anos` : 'Idade não informada'}
        </div>
        {/* DEBUG INFO (remover em produção) */}
        <div className="text-xs text-red-400 opacity-50">
          Fotos: {pessoa.fotos.length} | Loaded: {imageLoaded ? 'OK' : 'NO'} | Error: {imageError ? 'YES' : 'NO'}
        </div>
      </div>
    </Link>
  )
}