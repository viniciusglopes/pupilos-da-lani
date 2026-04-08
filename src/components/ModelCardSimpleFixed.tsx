'use client'

import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ModelCardProps {
  pessoa: PessoaCompleta
  source?: string
}

export default function ModelCardSimpleFixed({ pessoa, source = 'homepage' }: ModelCardProps) {
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
    <Link href={`/pupilos/${pessoa.id}?from=${source}`} className="group cursor-pointer block min-w-0">
      <div className="relative w-full overflow-hidden bg-gray-100 border border-gray-200" style={{paddingBottom: '133.33%'}}>
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={pessoa.nome}
            fill
            className="object-cover object-center transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
            quality={75}
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300 text-xs tracking-widest uppercase">
            Sem foto
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        {/* Ver Perfil no hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-xs text-white/80 uppercase tracking-wider">Ver Perfil</span>
        </div>
      </div>

      <div className="pt-2 pb-3">
        <h3 className="text-xs font-semibold text-black tracking-wide uppercase truncate">
          {pessoa.nome}
        </h3>
      </div>
    </Link>
  )
}
