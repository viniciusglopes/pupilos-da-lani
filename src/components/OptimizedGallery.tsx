'use client'

import { useState, useEffect, useCallback } from 'react'
import OptimizedImage from './OptimizedImage'
import { batchPreloadImages, IMAGE_SIZES } from '@/utils/imageOptimization'

interface Media {
  id: string
  url_arquivo: string
  tipo?: 'foto' | 'video'
}

interface OptimizedGalleryProps {
  fotos: Media[]
  videos?: Media[]
  personName: string
  onImageClick?: (index: number) => void
  className?: string
}

export default function OptimizedGallery({ 
  fotos, 
  videos = [], 
  personName,
  onImageClick,
  className = ''
}: OptimizedGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos'>('fotos')
  const [preloadedRanges, setPreloadedRanges] = useState<Set<number>>(new Set())
  const [isPreloading, setIsPreloading] = useState(false)

  const currentMedia = activeTab === 'fotos' ? fotos : videos
  const hasVideos = videos.length > 0

  // Preload images in intelligent batches
  const preloadImages = useCallback(async (centerIndex: number, radius: number = 3) => {
    if (currentMedia.length === 0 || isPreloading) return

    const start = Math.max(0, centerIndex - radius)
    const end = Math.min(currentMedia.length - 1, centerIndex + radius)
    const rangeKey = start * 1000 + end // Simple hash for range
    
    if (preloadedRanges.has(rangeKey)) return
    
    setIsPreloading(true)
    
    try {
      const urlsToPreload = currentMedia
        .slice(start, end + 1)
        .map(item => item.url_arquivo)
      
      await batchPreloadImages(urlsToPreload, 2, 'low')
      
      setPreloadedRanges(prev => new Set(prev).add(rangeKey))
    } catch (error) {
      console.warn('Failed to preload images:', error)
    } finally {
      setIsPreloading(false)
    }
  }, [currentMedia, preloadedRanges, isPreloading])

  // Preload images when current index changes
  useEffect(() => {
    preloadImages(currentIndex)
  }, [currentIndex, preloadImages])

  // Initial preload of first few images
  useEffect(() => {
    if (currentMedia.length > 0) {
      preloadImages(0, 2) // Preload first 5 images
    }
  }, [currentMedia, preloadImages])

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % currentMedia.length
    setCurrentIndex(newIndex)
    onImageClick?.(newIndex)
  }

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length
    setCurrentIndex(newIndex)
    onImageClick?.(newIndex)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    onImageClick?.(index)
  }

  const switchTab = (tab: 'fotos' | 'videos') => {
    setActiveTab(tab)
    setCurrentIndex(0)
  }

  if (currentMedia.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[400px] bg-gray-50`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-500 text-sm uppercase tracking-wide">
            Nenhuma {activeTab === 'fotos' ? 'foto' : 'vídeo'} disponível
          </p>
        </div>
      </div>
    )
  }

  const currentItem = currentMedia[currentIndex]

  return (
    <div className={className}>
      {/* Tabs */}
      {hasVideos && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => switchTab('fotos')}
            className={`px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors ${
              activeTab === 'fotos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Fotos ({fotos.length})
          </button>
          <button
            onClick={() => switchTab('videos')}
            className={`px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors ${
              activeTab === 'videos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Vídeos ({videos.length})
          </button>
        </div>
      )}

      {/* Main Media */}
      <div className="relative aspect-[4/5] bg-gray-50 mb-6 overflow-hidden group">
        {activeTab === 'fotos' ? (
          <OptimizedImage
            src={currentItem.url_arquivo}
            alt={`${personName} - ${currentIndex + 1}`}
            fill
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 66vw"
            quality={90}
            priority={currentIndex === 0}
            imageSize="gallery"
            enableResponsive={true}
          />
        ) : (
          <video
            src={currentItem.url_arquivo}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
            onError={(e) => console.warn('Video load error:', currentItem.url_arquivo)}
          />
        )}

        {/* Navigation Controls */}
        {currentMedia.length > 1 && activeTab === 'fotos' && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-all duration-200 text-xl font-bold shadow-lg opacity-0 group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-all duration-200 text-xl font-bold shadow-lg opacity-0 group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}

        {/* Counter */}
        {currentMedia.length > 1 && (
          <div className="absolute top-4 right-4 text-sm text-gray-600 bg-white/90 px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIndex + 1} / {currentMedia.length}
          </div>
        )}

        {/* Preloading indicator */}
        {isPreloading && (
          <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded">
            Carregando...
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {currentMedia.length > 1 && (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {currentMedia.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToImage(index)}
              className={`relative aspect-square overflow-hidden transition-all duration-200 ${
                index === currentIndex 
                  ? 'ring-2 ring-black scale-105' 
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              {activeTab === 'fotos' ? (
                <OptimizedImage
                  src={item.url_arquivo}
                  alt={`${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  quality={50}
                  imageSize="thumbnail"
                />
              ) : (
                <video
                  src={item.url_arquivo}
                  className="w-full h-full object-cover"
                  preload="none"
                  muted
                />
              )}
              
              {/* Thumbnail overlay with number */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>

              {/* Video indicator */}
              {activeTab === 'videos' && (
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-black/80 rounded-full flex items-center justify-center">
                  <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Keyboard navigation hint */}
      {currentMedia.length > 1 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Use as setas do teclado ← → ou clique nas miniaturas para navegar
          </p>
        </div>
      )}
    </div>
  )
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  onNext: () => void,
  onPrev: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [onNext, onPrev, enabled])
}