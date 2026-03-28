/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ]
  },
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
        hostname: 'lh3.googleusercontent.com',
        pathname: "**",
      },
      // APPLE RESİMLERİ İÇİN (Hata aldığın adres)
      {
        protocol: "https",
        hostname: 'store.storeimages.cdn-apple.com',
        pathname: "**",
      },
      // TEST RESİMLERİ İÇİN (Picsum vb.)
      {
        protocol: "https",
        hostname: 'picsum.photos',
        pathname: "**",
      },
      // PLACEHOLDER RESİMLERİ İÇİN
      {
        protocol: "https",
        hostname: 'via.placeholder.com',
        pathname: "**",
      },

      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.apple.com',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Test resimleri için
      },
    ],
  },
}

module.exports = nextConfig