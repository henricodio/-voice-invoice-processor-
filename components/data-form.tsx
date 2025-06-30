"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Wand2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductForm from "./product-form"

interface DataFormProps {
  transcription: string
  onDataExtracted: (data: any) => void
  initialDocumentType?: string
}

export default function DataForm({ transcription, onDataExtracted, initialDocumentType = "contacto" }: DataFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    cargo: "",
    fecha: "",
    notas: "",
    categoria: "",
    tipo_documento: initialDocumentType, // contacto, factura, presupuesto
  })
  const [products, setProducts] = useState<Array<{
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    impuesto: number;
  }>>([]);
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("datos")
  const { toast } = useToast()

  const extractDataFromText = async () => {
    if (!transcription) {
      toast({
        title: "Error",
        description: "No hay transcripción disponible",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)

    try {
      const response = await fetch("/api/extract-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcription }),
      })

      if (!response.ok) {
        throw new Error("Error al extraer datos")
      }

      const extractedData = await response.json()
      setFormData((prev) => ({ ...prev, ...extractedData }))

      toast({
        title: "Éxito",
        description: "Datos extraídos automáticamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al extraer datos del texto",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const saveData = async () => {
    setIsSaving(true)

    try {
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        fecha: formData.fecha || new Date().toISOString().split("T")[0],
        transcripcion: transcription,
        products: formData.tipo_documento === "factura" ? products : [] // Solo enviar productos si es una factura
      }

      const response = await fetch("/api/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al guardar datos")
      }

      const savedData = await response.json()
      onDataExtracted(savedData)

      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        cargo: "",
        fecha: "",
        notas: "",
        categoria: "",
        tipo_documento: "contacto",
      })
      
      // Limpiar productos
      setProducts([])

      toast({
        title: "Éxito",
        description: "Datos guardados correctamente",
      })
    } catch (error) {
      console.error("Error al guardar:", error);
      
      // Manejo de errores más específico
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al guardar los datos",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Texto Transcrito
              <Button onClick={extractDataFromText} disabled={isExtracting} variant="outline" size="sm">
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extrayendo...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Extraer Datos
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap p-4 bg-muted rounded-md">{transcription}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos Extraídos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Select 
                value={formData.tipo_documento} 
                onValueChange={(value) => handleInputChange("tipo_documento", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacto">Contacto</SelectItem>
                  <SelectItem value="factura">Factura</SelectItem>
                  <SelectItem value="presupuesto">Presupuesto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="datos">Datos Generales</TabsTrigger>
                <TabsTrigger 
                  value="productos"
                  disabled={formData.tipo_documento !== "factura" && formData.tipo_documento !== "presupuesto"}
                >
                  Productos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="datos" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => handleInputChange("empresa", e.target.value)}
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleInputChange("cargo", e.target.value)}
                      placeholder="Posición o cargo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="proveedor">Proveedor</SelectItem>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="contacto">Contacto</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notas">Notas Adicionales</Label>
                    <Textarea
                      id="notas"
                      value={formData.notas}
                      onChange={(e) => handleInputChange("notas", e.target.value)}
                      placeholder="Información adicional..."
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="productos" className="mt-4">
                <ProductForm 
                  products={products} 
                  onProductsChange={setProducts} 
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button 
                onClick={saveData} 
                disabled={isSaving || !formData.nombre} 
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar {formData.tipo_documento === "factura" ? "Factura" : 
                           formData.tipo_documento === "presupuesto" ? "Presupuesto" : "Datos"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
