"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GuiaPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirigir a la página de guía HTML
    window.location.href = "/guia-usuario.html"
  }, [])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Cargando guía de usuario...</p>
    </div>
  )
}
