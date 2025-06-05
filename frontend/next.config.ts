import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          path: false,
          os: false,
          crypto: false,
          module: false,
          v8: false,
          perf_hooks: false,
          ...(config.resolve?.fallback || {}),
        },
      }
    }
    return config
  },
  transpilePackages: ['tailwindcss'],
  experimental: {
    optimizePackageImports: ['tailwindcss'],
  },

}
module.exports = {
  reactStrictMode: false, // dev only
};
export default nextConfig
