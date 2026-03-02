import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miymyomckhazcrdvgfqa.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'supabase-api.segopi.es',
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
}

export default nextConfig
