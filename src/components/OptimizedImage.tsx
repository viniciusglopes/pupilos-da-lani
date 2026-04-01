'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl, generateSrcSet, IMAGE_SIZES, getOptimalImageQuality } from '@/utils/imageOptimization'
import type { ImageSizeConfig } from '@/utils/imageOptimization'

interface OptimizedImageProps {
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
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  imageSize?: keyof ImageSizeConfig
  enableResponsive?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  quality,
  priority = false,
  onClick,
  placeholder = 'blur',
  blurDataURL,
  imageSize = 'card',
  enableResponsive = true
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [optimalQuality, setOptimalQuality] = useState(quality || 75)

  // Get optimal quality based on connection
  useEffect(() => {
    if (!quality) {
      setOptimalQuality(getOptimalImageQuality())
    }
  }, [quality])

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, imageSize, { 
    quality: optimalQuality,
    width,
    height
  })
  
  const responsiveSrcSet = enableResponsive ? generateSrcSet(src) : undefined
  
  // Generate blur placeholder
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

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

      {/* Optimized image */}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover'
        }}
      />
    </div>
  )
}