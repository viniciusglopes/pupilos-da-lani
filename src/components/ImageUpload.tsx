'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  onUpload: (url: string) => void
  bucket?: string
  folder?: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
  accept?: string
  className?: string
  buttonText?: string
}

export default function ImageUpload({
  onUpload,
  bucket = 'fotos',
  folder = '',
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 80,
  accept = 'image/*',
  className = '',
  buttonText = 'Adicionar Foto'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [optimizing, setOptimizing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        // Resize if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          'image/webp',
          quality / 100
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setOptimizing(true)
      setUploadProgress(0)

      // Compress image
      const compressedFile = await compressImage(file)
      
      setOptimizing(false)
      setIsUploading(true)

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile, {
          cacheControl: '31536000', // 1 year cache
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onUpload(urlData.publicUrl)

      // Show compression stats
      const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100
      console.log(`Imagem otimizada: ${compressionRatio.toFixed(1)}% menor (${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`)

    } catch (error: any) {
      console.error('Erro no upload:', error)
      alert(`Erro no upload: ${error.message}`)
    } finally {
      setIsUploading(false)
      setOptimizing(false)
      setUploadProgress(0)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const isProcessing = isUploading || optimizing

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="hidden"
        id="image-upload"
      />
      
      <label
        htmlFor="image-upload"
        className={`
          inline-flex items-center justify-center px-4 py-2 border text-sm font-medium transition-colors cursor-pointer
          ${isProcessing 
            ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed' 
            : 'border-black text-black hover:bg-black hover:text-white'
          }
        `}
      >
        {optimizing && (
          <>
            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-400 border-t-black rounded-full"></div>
            Otimizando...
          </>
        )}
        
        {isUploading && (
          <>
            <div className="animate-pulse -ml-1 mr-2 h-4 w-4 border-2 border-gray-400 border-t-black rounded-full"></div>
            Enviando...
          </>
        )}
        
        {!isProcessing && buttonText}
      </label>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-black h-1 transition-all duration-300"
              style={{ 
                width: optimizing ? '50%' : isUploading ? '100%' : '0%' 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {optimizing && 'Otimizando imagem...'}
            {isUploading && 'Enviando para servidor...'}
          </p>
        </div>
      )}

      {/* Upload tips */}
      <div className="mt-2 text-xs text-gray-500">
        <p>• Tamanho máximo: {maxWidth}x{maxHeight}px</p>
        <p>• Formato: JPEG, PNG, WebP</p>
        <p>• Compressão automática ativa</p>
      </div>
    </div>
  )
}