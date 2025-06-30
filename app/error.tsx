"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error capturado por el componente de error:", error)
  }, [error])

  return (
    <div className="container mx-auto p-6 max-w-lg flex items-center justify-center min-h-[60vh]">
      <Card className="w-full border-destructive/50">
        <CardHeader className="bg-destructive/10 text-destructive">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            <div>
              <CardTitle>¡Ups! Algo salió mal</CardTitle>
              <CardDescription className="text-destructive/80">
                Se ha producido un error inesperado.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Puedes intentar recargar la página para solucionar el problema.
          </p>
          <Button
            onClick={() => reset()}
            variant="destructive"
          >
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
