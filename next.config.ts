import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'], // 🔥 Optimiza automáticamente las imágenes
    remotePatterns: [
      // 🖥️ Local (modo desarrollo)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
      // 🌐 VPS o backend remoto (Payload CMS)
      {
        protocol: 'http',
        hostname: '69.62.110.55',
        port: '3000',
        pathname: '/api/media/**',
      },
      // 🚀 Dominio de producción (sitio público)
      {
        protocol: 'https',
        hostname: 'whatif-arch.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.whatif-arch.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    // URL base para conectarte al Payload CMS desde el frontend
    PAYLOAD_API_URL:
      process.env.PAYLOAD_API_URL || 'http://69.62.110.55:3000/api',
  },
  async headers() {
    return [
      {
        source: '/cache/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
    ]
  },
}

export default nextConfig
