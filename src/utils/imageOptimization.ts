// Image optimization utilities

export interface ImageOptimizationConfig {
  quality: number
  format: 'webp' | 'jpeg' | 'png'
  width?: number
  height?: number
}

export interface ImageSizeConfig {
  thumbnail: { width: 150, height: 200, quality: 60 }
  card: { width: 300, height: 400, quality: 70 }
  gallery: { width: 800, height: 1067, quality: 85 }
  full: { width: 1200, height: 1600, quality: 90 }
}

export const IMAGE_SIZES: ImageSizeConfig = {
  thumbnail: { width: 150, height: 200, quality: 60 },
  card: { width: 300, height: 400, quality: 70 },
  gallery: { width: 800, height: 1067, quality: 85 },
  full: { width: 1200, height: 1600, quality: 90 }
}

export function getOptimizedImageUrl(
  originalUrl: string, 
  size: keyof ImageSizeConfig = 'card',
  customConfig?: Partial<ImageOptimizationConfig>
): string {
  if (!originalUrl) return ''
  
  const config = { ...IMAGE_SIZES[size], ...customConfig }
  
  try {
    // For Supabase URLs, add optimization parameters
    if (originalUrl.includes('supabase') || originalUrl.includes('storage')) {
      const url = new URL(originalUrl)
      
      if (config.width) url.searchParams.set('width', config.width.toString())
      if (config.height) url.searchParams.set('height', config.height.toString())
      url.searchParams.set('quality', config.quality.toString())
      
      // Prefer WebP format for better compression
      if (config.format) {
        url.searchParams.set('format', config.format)
      } else {
        url.searchParams.set('format', 'webp')
      }
      
      return url.toString()
    }
    
    // For other URLs, use our optimization API
    const params = new URLSearchParams({
      url: originalUrl,
      quality: config.quality.toString()
    })
    
    if (config.width) params.set('width', config.width.toString())
    if (config.height) params.set('height', config.height.toString())
    if (config.format) params.set('format', config.format)
    
    return `/api/optimize-image?${params.toString()}`
    
  } catch (error) {
    console.warn('Failed to optimize image URL:', error)
    return originalUrl
  }
}

// Generate srcSet for responsive images
export function generateSrcSet(originalUrl: string): string {
  if (!originalUrl) return ''
  
  const sizes = [
    { size: 'thumbnail', descriptor: '150w' },
    { size: 'card', descriptor: '300w' },
    { size: 'gallery', descriptor: '800w' },
    { size: 'full', descriptor: '1200w' }
  ] as const
  
  return sizes
    .map(({ size, descriptor }) => 
      `${getOptimizedImageUrl(originalUrl, size)} ${descriptor}`
    )
    .join(', ')
}

// Preload critical images
export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    // Check if already in cache
    const cached = imageCache.get(src)
    if (cached) {
      resolve()
      return
    }

    const img = new Image()
    
    img.onload = () => {
      imageCache.set(src, img)
      resolve()
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to preload image: ${src}`))
    }

    // Set priority for modern browsers
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = priority
    }

    img.src = src
  })
}

// Simple in-memory image cache
const imageCache = new Map<string, HTMLImageElement>()

export function clearImageCache(): void {
  imageCache.clear()
}

export function getImageFromCache(src: string): HTMLImageElement | null {
  return imageCache.get(src) || null
}

// Batch preload images with intelligent scheduling
export async function batchPreloadImages(
  urls: string[], 
  maxConcurrent: number = 3,
  priority: 'high' | 'low' = 'low'
): Promise<void> {
  const chunks = []
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    chunks.push(urls.slice(i, i + maxConcurrent))
  }
  
  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map(url => preloadImage(getOptimizedImageUrl(url, 'thumbnail'), priority))
    )
    
    // Small delay between batches to avoid overwhelming the browser
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Smart image loading based on connection speed
export function getOptimalImageQuality(): number {
  if (typeof window === 'undefined') return 80
  
  // Check connection type if available
  const connection = (navigator as any)?.connection
  if (connection) {
    const effectiveType = connection.effectiveType
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 50
      case '3g':
        return 65
      case '4g':
        return 80
      default:
        return 85
    }
  }
  
  return 80 // Default quality
}

// Get optimal image size based on viewport and device
export function getOptimalImageSize(containerWidth: number): keyof ImageSizeConfig {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const targetWidth = containerWidth * dpr
  
  if (targetWidth <= 150) return 'thumbnail'
  if (targetWidth <= 300) return 'card'  
  if (targetWidth <= 800) return 'gallery'
  return 'full'
}

// Calculate image dimensions while maintaining aspect ratio
export function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight)
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Check if WebP is supported
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(true) // Assume support on server
      return
    }

    const webpData = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA=='
    
    const img = new Image()
    img.onload = img.onerror = () => {
      resolve(img.height === 2)
    }
    img.src = webpData
  })
}