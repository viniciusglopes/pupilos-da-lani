/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.com',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Docker build optimizations
  output: 'standalone',
  swcMinify: true,
  compress: true,

  experimental: {
    optimizeCss: false, // Prevent CSS issues in Docker builds
    staleTimes: {
      dynamic: 30,  // 30s for dynamic pages
      static: 180,  // 3min for static pages
    },
  },

  // EMERGENCY FIX: env vars baked in for Coolify compatibility
  // TODO Phase 2: remove after confirming Coolify env vars work independently
  env: {
    CUSTOM_KEY: 'pupilos-da-lani',
    NEXT_PUBLIC_SUPABASE_URL: 'https://ljttishwndzkcytkdsrc.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjY2M30.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk',
    NEXT_PUBLIC_ADMIN_PASSWORD: 'admin2026',
  },

  // Webpack config for Docker builds
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    return config
  },

  // Security and cache headers
  async headers() {
    return [
      // Admin pages — no cache
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      // API routes — short cache
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=30, s-maxage=60' },
        ],
      },
      // Static assets — long cache
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Public pages — medium cache + security headers
      {
        source: '/((?!admin|api).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=180, s-maxage=300' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
