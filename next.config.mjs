/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for error detection
  reactStrictMode: true,
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Add image optimization for external domains if needed
  images: {
    domains: [],
  },
  
  // Configure webpack if needed
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
