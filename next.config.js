const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com', 'picsum.photos'],
    formats: ['image/avif', 'image/webp'],
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

};

module.exports = withPWA(withBundleAnalyzer(nextConfig));
