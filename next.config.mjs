/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de imagen
  images: {
    unoptimized: true,
  },
  // Desactivar modo estricto para evitar renderizados dobles
  reactStrictMode: false,
  // Configuración para Netlify
  output: 'standalone',
  // Configuración para forzar renderizado en cliente (CSR)
  // Esta es la solución nuclear para problemas de hidratación
  experimental: {
    // Usar App Router
    appDir: true,
  },
  // Desactivar completamente SSR
  // Esto evita cualquier problema de hidratación
  webpack: (config, { isServer }) => {
    // Si estamos en el servidor, devolvemos un objeto vacío
    // Esto hace que Next.js no renderice nada en el servidor
    if (isServer) {
      // Mantenemos solo lo esencial para que la build no falle
      config.resolve.fallback = { fs: false, net: false, tls: false };
    }
    return config;
  },
}

export default nextConfig
