'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyImageOptions {
  threshold?: number
  rootMargin?: string
  placeholder?: string
}

export function useLazyImages(options: LazyImageOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTc1SDE3NVYyMjVIMTI1VjE3NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
  } = options

  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id')
            if (imageId) {
              setVisibleImages(prev => new Set(prev).add(imageId))
              observerRef.current?.unobserve(entry.target)
            }
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [threshold, rootMargin])

  const observeImage = (element: HTMLElement | null, imageId: string) => {
    if (element && observerRef.current) {
      element.setAttribute('data-image-id', imageId)
      observerRef.current.observe(element)
    }
  }

  const isImageVisible = (imageId: string) => {
    return visibleImages.has(imageId)
  }

  return {
    observeImage,
    isImageVisible,
    placeholder
  }
}

interface LazyImageState {
  isLoaded: boolean
  hasError: boolean
  isInView: boolean
}

export function useLazyImage(src: string, options: LazyImageOptions = {}) {
  const [state, setState] = useState<LazyImageState>({
    isLoaded: false,
    hasError: false,
    isInView: false
  })
  
  const imgRef = useRef<HTMLElement>(null)
  const { observeImage, isImageVisible, placeholder } = useLazyImages(options)

  useEffect(() => {
    if (imgRef.current) {
      observeImage(imgRef.current, src)
    }
  }, [src, observeImage])

  useEffect(() => {
    const isVisible = isImageVisible(src)
    setState(prev => ({ ...prev, isInView: isVisible }))

    if (isVisible && !state.isLoaded && !state.hasError) {
      // Preload image
      const img = new Image()
      
      img.onload = () => {
        setState(prev => ({ ...prev, isLoaded: true }))
      }
      
      img.onerror = () => {
        setState(prev => ({ ...prev, hasError: true }))
      }

      img.src = src
    }
  }, [src, isImageVisible, state.isLoaded, state.hasError])

  return {
    ref: imgRef,
    isLoaded: state.isLoaded,
    hasError: state.hasError,
    isInView: state.isInView,
    placeholder,
    shouldLoad: state.isInView
  }
}