/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Disable static generation for problematic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
