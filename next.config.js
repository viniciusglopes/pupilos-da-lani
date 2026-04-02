/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache inteligente - diferente para cada tipo de conteúdo
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 segundos para páginas dinâmicas
      static: 180, // 3 minutos para páginas estáticas
    },
  },
  
  // Headers inteligentes por tipo de conteúdo
  async headers() {
    return [
      // Admin pages - sem cache
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      // API routes - cache curto
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=30, s-maxage=60',
          },
        ],
      },
      // Assets estáticos - cache longo
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Páginas públicas - cache médio
      {
        source: '/((?!admin|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=180, s-maxage=300',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
  
  // Deploy settings
  output: 'standalone',
  
  // Image optimization (keep existing)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ljttishwndzkcytkdsrc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig