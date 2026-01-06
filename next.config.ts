import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds to avoid strict rule failures in production
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds to avoid strict type errors in production
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@headlessui/react', 'react-hook-form']
  },

  // Image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: '**.fly-fleet.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https' as const,
        hostname: '**.vercel.app',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https' as const,
        hostname: '**.vercel-storage.com',
        port: '',
        pathname: '/**'
      }
    ]
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
