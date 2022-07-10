/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.jsdelivr.net', 'raw.githubusercontent.com', 'ipfs.io'],
  }
}

module.exports = nextConfig
