/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
        dangerouslyAllowSVG: true,
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
