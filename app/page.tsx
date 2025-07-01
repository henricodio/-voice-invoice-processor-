import dynamic from 'next/dynamic'

// Carga dinámica del componente principal de la aplicación, deshabilitando el SSR.
const MainApp = dynamic(() => import('@/components/main-app'), {
  ssr: false, // Esta es la clave: el componente no se renderizará en el servidor.
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
})

export default function Home() {
  return <MainApp />
}

