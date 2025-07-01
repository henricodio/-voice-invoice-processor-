/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Configuración para evitar errores de hidratación
  reactStrictMode: false,
  // Asegurarse de que todo se renderiza en el cliente
  experimental: {
    // Forzar renderizado en el cliente para evitar problemas de hidratación
    appDir: true,
  },
  // Configuración para Netlify
  output: 'standalone',
}

export default nextConfig
