import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface OptimizeParams {
  url: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params: OptimizeParams = {
      url: searchParams.get('url') || '',
      width: searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined,
      height: searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined,
      quality: searchParams.get('quality') ? parseInt(searchParams.get('quality')!) : 75,
      format: (searchParams.get('format') as 'webp' | 'jpeg' | 'png') || 'webp'
    }

    if (!params.url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let sourceUrl: URL
    try {
      sourceUrl = new URL(params.url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Only allow Supabase storage URLs for security
    if (!sourceUrl.hostname.includes('supabase') && !sourceUrl.hostname.includes('pupiloslani.com.br')) {
      return NextResponse.json(
        { error: 'URL not allowed' },
        { status: 403 }
      )
    }

    // Fetch the original image
    const response = await fetch(params.url, {
      headers: {
        'User-Agent': 'PupilosLani-ImageOptimizer/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to an image' },
        { status: 400 }
      )
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    // Check if we have Sharp available for server-side image processing
    let processedBuffer = buffer
    let finalContentType = contentType

    try {
      // Try to use Sharp for image optimization
      const sharp = require('sharp')
      
      let pipeline = sharp(buffer)
      
      // Resize if dimensions provided
      if (params.width || params.height) {
        pipeline = pipeline.resize(params.width, params.height, {
          fit: 'cover',
          withoutEnlargement: true
        })
      }
      
      // Convert format and set quality
      switch (params.format) {
        case 'webp':
          pipeline = pipeline.webp({ quality: params.quality })
          finalContentType = 'image/webp'
          break
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality: params.quality })
          finalContentType = 'image/jpeg'
          break
        case 'png':
          pipeline = pipeline.png({ quality: params.quality })
          finalContentType = 'image/png'
          break
      }
      
      processedBuffer = await pipeline.toBuffer()
      
    } catch (sharpError) {
      // Sharp not available or error, fall back to returning original
      console.warn('Sharp processing failed, returning original image:', sharpError)
      
      // If we can't process, at least try to return optimized headers
      finalContentType = params.format === 'webp' ? 'image/webp' : contentType
    }

    // Set caching headers for optimization
    const headers = new Headers()
    headers.set('Content-Type', finalContentType)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable') // 1 year cache
    headers.set('Content-Length', processedBuffer.length.toString())
    
    // Add optimization info headers
    headers.set('X-Original-Size', buffer.length.toString())
    headers.set('X-Optimized-Size', processedBuffer.length.toString())
    headers.set('X-Compression-Ratio', (((buffer.length - processedBuffer.length) / buffer.length) * 100).toFixed(2))

    return new NextResponse(processedBuffer, {
      headers,
      status: 200
    })

  } catch (error: any) {
    console.error('Image optimization error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to optimize image',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined
    const quality = formData.get('quality') ? parseInt(formData.get('quality') as string) : 75

    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      const sharp = require('sharp')
      
      let pipeline = sharp(buffer)
      
      // Get original metadata
      const metadata = await pipeline.metadata()
      
      // Resize if needed
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit: 'cover',
          withoutEnlargement: true
        })
      }
      
      // Convert to WebP with quality optimization
      const optimizedBuffer = await pipeline
        .webp({ quality })
        .toBuffer()

      const compressionRatio = ((buffer.length - optimizedBuffer.length) / buffer.length) * 100

      return NextResponse.json({
        success: true,
        originalSize: buffer.length,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: compressionRatio.toFixed(2),
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        }
      })

    } catch (sharpError) {
      return NextResponse.json(
        { error: 'Image processing failed', details: sharpError },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Image upload optimization error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process image upload', details: error.message },
      { status: 500 }
    )
  }
}