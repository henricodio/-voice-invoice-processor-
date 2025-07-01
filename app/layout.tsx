import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'
import ClientWrapper from './client-wrapper'

export const metadata: Metadata = {
  title: 'Procesador de Facturas por Voz',
  description: 'Aplicación para procesar facturas mediante grabaciones de voz',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className="font-light">
        <ClientWrapper>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-6 px-4">
              {children}
            </main>
            <footer className="border-t py-4">
              <div className="container text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Procesador de Facturas por Voz
              </div>
            </footer>
          </div>
          <Toaster />
        </ClientWrapper>
      </body>
    </html>
  )
}
