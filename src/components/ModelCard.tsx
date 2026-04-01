'use client'

import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import OptimizedImage from './OptimizedImage'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ModelCardProps {
  pessoa: PessoaCompleta
  isParceiro?: boolean
}

export default function ModelCard({ pessoa, isParceiro = false }: ModelCardProps) {
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

  const handleClick = () => {
    // Track click analytics - TEMPORARIAMENTE DESABILITADO
    // fetch('/api/analytics/click', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     pupilo_id: pessoa.id
    //   }),
    // }).catch(err => console.warn('Click tracking failed:', err))
  }

  return (
    <Link
      href={`/pupilos/${pessoa.id}`}
      className="group cursor-pointer block"
      onClick={handleClick}
    >
      <div className="relative w-full h-40 overflow-hidden bg-gray-100">
        {fotoUrl ? (
          <OptimizedImage
            src={fotoUrl}
            alt={pessoa.nome}
            width={160}
            height={160}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            sizes="160px"
            quality={70}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <span className="text-gray-300 text-xs tracking-widest uppercase">Sem foto</span>
          </div>
        )}

        {/* Minimal overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        {/* Bottom info overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2">
            <span className="text-xs text-white/80 transition-colors uppercase tracking-wider">
              Ver Perfil
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 pb-3">
        <h3 className="text-xs font-semibold text-black tracking-wide uppercase line-clamp-1">
          {pessoa.nome}
        </h3>
        <div className="mt-1 text-xs text-gray-500">
          {pessoa.idade && <span>{pessoa.idade} anos</span>}
        </div>
      </div>
    </Link>
  )
}
