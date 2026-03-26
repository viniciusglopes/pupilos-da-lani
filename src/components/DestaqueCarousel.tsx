'use client'

import { useState, useEffect } from 'react'
import { PessoaCompleta } from '@/types/database'

interface DestaqueCarouselProps {
  pessoa: PessoaCompleta
}

export default function DestaqueCarousel({ pessoa }: DestaqueCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (pessoa.fotos.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % pessoa.fotos.length)
    }, 3000) // 3 segundos

    return () => clearInterval(interval)
  }, [pessoa.fotos.length])

  if (pessoa.fotos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-80">
          <div className="h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm">Sem fotos</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-80">
        <div className="carousel-container h-full">
          {pessoa.fotos.map((foto, index) => (
            <img 
              key={foto.id}
              src={foto.url_arquivo} 
              alt={`Foto ${index + 1} de ${pessoa.nome}`}
              className={`carousel-image ${index === currentIndex ? 'active' : ''}`}
            />
          ))}
          
          {/* Controles do carousel (apenas se houver mais de 1 foto) */}
          {pessoa.fotos.length > 1 && (
            <div className="carousel-controls">
              {pessoa.fotos.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}