import type { NextConfig } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  devIndicators: false,
  // Standalone output for optimized Render / Docker production builds
  output: 'standalone',
  // Proxy /api/* calls to the FastAPI backend so CORS is handled server-side
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
