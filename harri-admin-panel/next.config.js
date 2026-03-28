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
    unoptimized: true, // Tüm resimleri optimize etmeyi devre dışı bırakır
    remotePatterns: [
      // LOKAL BACKEND (Senin bilgisayarın)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/uploads/**',
      },
      // CANLI BACKEND (Railway vb. - Kendi backend domainini buraya ekle)
      {
        protocol: 'https',
        hostname: '**.railway.app', // Tüm railway projelerine izin verir
        pathname: '/uploads/**',
      },
      // PLACEHOLDER & TEST RESİMLERİ
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      // APPLE & CDN RESİMLERİ
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.apple.com',
        pathname: '/**',
      },
      // BULUT DEPOLAMA (İlerisi için)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig