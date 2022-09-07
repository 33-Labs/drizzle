/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.jsdelivr.net', 
      'raw.githubusercontent.com', 
      'ipfs.io', 
      'flovatar.com',
      'images.flovatar.com',
      'i.imgur.com',
      'ipfs.dapperlabs.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
}

module.exports = nextConfig
