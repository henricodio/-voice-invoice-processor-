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
};

export default nextConfig
