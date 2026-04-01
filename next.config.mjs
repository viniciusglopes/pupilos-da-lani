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
  },
  
  // Docker build optimizations - fix SWC issues
  output: 'standalone',
  swcMinify: true,
  compress: true,
  
  // Experimental features for Docker compatibility  
  experimental: {
    optimizeCss: false, // Prevent CSS issues in Docker builds
  },
  
  // Server actions habilitados por padrão no Next.js 14+
  // Otimizações para produção + FORCE ENV VARS
  env: {
    CUSTOM_KEY: 'pupilos-da-lani',
    // FORCE CLIENT-SIDE ENV VARS (EMERGENCY FIX)
    NEXT_PUBLIC_SUPABASE_URL: 'https://ljttishwndzkcytkdsrc.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjY2M30.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk',
    NEXT_PUBLIC_ADMIN_PASSWORD: 'admin2026',
  },
  
  // Webpack config for Docker builds
  webpack: (config, { isServer }) => {
    // Fix SWC and Docker compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    
    return config
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

export default nextConfig