"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, FileText, Receipt, ChevronRight, Building, CreditCard } from "lucide-react"

interface DocumentTypeSelectorProps {
  onSelect: (type: "cliente" | "factura") => void
}

export default function DocumentTypeSelector({ onSelect }: DocumentTypeSelectorProps) {
  const [hoverCard, setHoverCard] = useState<"cliente" | "factura" | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card 
        className={`cursor-pointer border-2 transition-all duration-300 shadow-lg overflow-hidden ${hoverCard === "cliente" ? "border-primary scale-[1.02] shadow-primary/20" : "border-primary/10 hover:border-primary/30"}`}
        onClick={() => onSelect("cliente")}
        onMouseEnter={() => setHoverCard("cliente")}
        onMouseLeave={() => setHoverCard(null)}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/10 transition-opacity duration-300 ${hoverCard === "cliente" ? "opacity-100" : "opacity-0"}`} />
        <CardContent className="p-8 flex flex-col items-center text-center relative z-10 h-full">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-full bg-blue-500/20 blur-md transition-opacity duration-300 ${hoverCard === "cliente" ? "opacity-100" : "opacity-0"}`} />
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full relative">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="mt-6 mb-2 flex items-center gap-2">
            <h3 className="text-xl font-semibold">Cliente</h3>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800">
              <Building className="h-3 w-3 mr-1" /> Contacto
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Datos de contacto y facturación
          </p>
          
          <Button 
            className={`w-full mt-auto group transition-all duration-300 ${hoverCard === "cliente" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            Crear Cliente
            <ChevronRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${hoverCard === "cliente" ? "transform translate-x-1" : ""}`} />
          </Button>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer border-2 transition-all duration-300 shadow-lg overflow-hidden ${hoverCard === "factura" ? "border-primary scale-[1.02] shadow-primary/20" : "border-primary/10 hover:border-primary/30"}`}
        onClick={() => onSelect("factura")}
        onMouseEnter={() => setHoverCard("factura")}
        onMouseLeave={() => setHoverCard(null)}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/10 transition-opacity duration-300 ${hoverCard === "factura" ? "opacity-100" : "opacity-0"}`} />
        <CardContent className="p-8 flex flex-col items-center text-center relative z-10 h-full">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-full bg-purple-500/20 blur-md transition-opacity duration-300 ${hoverCard === "factura" ? "opacity-100" : "opacity-0"}`} />
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-full relative">
              <Receipt className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="mt-6 mb-2 flex items-center gap-2">
            <h3 className="text-xl font-semibold">Factura</h3>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800">
              <CreditCard className="h-3 w-3 mr-1" /> Venta
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Productos, cantidades y valores
          </p>
          
          <Button 
            className={`w-full mt-auto group transition-all duration-300 ${hoverCard === "factura" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          >
            Crear Factura
            <ChevronRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${hoverCard === "factura" ? "transform translate-x-1" : ""}`} />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
