import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: '69.62.110.55',
        port: '3000',
        pathname: '/api/media/file/**',
      },
    ],
  },
  env: {
    PAYLOAD_API_URL: process.env.PAYLOAD_API_URL || 'http://localhost:3000/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.PAYLOAD_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
