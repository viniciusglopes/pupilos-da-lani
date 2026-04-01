'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SimpleImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  quality?: number
  priority?: boolean
  onClick?: () => void
}

export default function SimpleImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  quality = 80,
  priority = false,
  onClick
}: SimpleImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Erro ao carregar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center ${className}`}
        >
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide">Carregando...</p>
          </div>
        </div>
      )}

      {/* Simple image without optimization */}
      <Image
        src={src} // Use original URL directly
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        sizes={sizes}
        quality={quality}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover'
        }}
      />
    </div>
  )
}