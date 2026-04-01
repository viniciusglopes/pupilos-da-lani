'use client'

import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ModelCardProps {
  pessoa: PessoaCompleta
  isParceiro?: boolean
}

export default function ModelCardSimple({ pessoa, isParceiro = false }: ModelCardProps) {
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
    <Link
      href={`/pupilos/${pessoa.id}`}
      className="group cursor-pointer block"
    >
      {/* Container da imagem - altura fixa */}
      <div 
        className="relative overflow-hidden bg-gray-100"
        style={{ width: '100%', height: '160px' }}
      >
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={pessoa.nome}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-700 group-hover:scale-105"
            sizes="160px"
            quality={70}
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100 text-gray-300 text-xs tracking-widest uppercase"
            style={{ width: '100%', height: '160px' }}
          >
            Sem foto
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-xs text-white/80 uppercase tracking-wider">
            Ver Perfil
          </span>
        </div>
      </div>

      {/* Info abaixo da imagem */}
      <div className="pt-2 pb-3">
        <h3 className="text-xs font-semibold text-black tracking-wide uppercase truncate">
          {pessoa.nome}
        </h3>
        <div className="mt-1 text-xs text-gray-500">
          {pessoa.idade ? `${pessoa.idade} anos` : 'Idade não informada'}
        </div>
      </div>
    </Link>
  )
}