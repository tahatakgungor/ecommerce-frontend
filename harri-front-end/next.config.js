/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'i.ibb.co',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 'res.cloudinary.com',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 'placehold.co',
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: 'localhost',
        port: '8081',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: '**.railway.app',
        pathname: "**",
      },
    ],
  },
}

module.exports = nextConfig
