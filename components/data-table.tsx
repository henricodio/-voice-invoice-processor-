"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Trash2, Eye, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import supabase from "@/config/supabase"

interface DataTableProps {
  initialData?: any[]
}

export default function DataTable({ initialData = [] }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [data, setData] = useState<any[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Cargar datos de Supabase
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/save-data")
      if (!response.ok) {
        throw new Error("Error al cargar los datos")
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) => value && typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const exportToCSV = () => {
    if (data.length === 0) return

    const headers = Object.keys(data[0]).join(",")
    const rows = data
      .map((item) =>
        Object.values(item)
          .map((value) => `"${value || ""}"`)
          .join(","),
      )
      .join("\n")

    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "datos_extraidos.csv"
    a.click()

    URL.revokeObjectURL(url)
  }

  type CategoryKey = 'cliente' | 'proveedor' | 'empleado' | 'contacto' | 'otro';

  const getCategoryColor = (categoria: string) => {
    const colors: Record<CategoryKey, string> = {
      cliente: "bg-blue-100 text-blue-800",
      proveedor: "bg-green-100 text-green-800",
      empleado: "bg-purple-100 text-purple-800",
      contacto: "bg-orange-100 text-orange-800",
      otro: "bg-gray-100 text-gray-800",
    }
    return colors[categoria as CategoryKey] || colors.otro
  }

  // Eliminar un registro
  const deleteRecord = async (id: string) => {
    if (!id) return

    try {
      const response = await fetch(`/api/delete-data?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el registro")
      }

      // Actualizar la lista de datos
      setData(data.filter(item => item.id !== id))
      
      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Cargando datos...</p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">No hay registros guardados todavía.</p>
            <Link href="/" passHref>
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                Crear nuevo registro
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">No hay datos disponibles</p>
          <p className="text-sm text-muted-foreground mt-2">Los datos extraídos del audio aparecerán aquí</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en los datos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Extraídos ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.telefono}</TableCell>
                    <TableCell>{item.empresa}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.categoria)}>{item.categoria}</Badge>
                    </TableCell>
                    <TableCell>{item.fecha}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Registro</DialogTitle>
                              <DialogDescription>Información completa del registro extraído</DialogDescription>
                            </DialogHeader>
                            {selectedRecord && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {Object.entries(selectedRecord)
                                    .filter(([key]) => key !== 'products' && key !== 'transcripcion')
                                    .map(([key, value]) => (
                                      <div key={key}>
                                        <label className="text-sm font-medium capitalize">{key.replace("_", " ")}</label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {typeof value === 'object' && value !== null
                                            ? JSON.stringify(value)
                                            : value?.toString() || "No especificado"}
                                        </p>
                                      </div>
                                  ))}
                                </div>
                                
                                {/* Mostrar productos si es una factura o presupuesto */}
                                {selectedRecord.products && selectedRecord.products.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Productos</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nombre</TableHead>
                                          <TableHead>Cantidad</TableHead>
                                          <TableHead>Precio Unit.</TableHead>
                                          <TableHead>Impuesto</TableHead>
                                          <TableHead>Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedRecord.products.map((product: any, index: number) => (
                                          <TableRow key={index}>
                                            <TableCell>{product.nombre}</TableCell>
                                            <TableCell>{product.cantidad}</TableCell>
                                            <TableCell>{product.precio_unitario?.toFixed(2)}€</TableCell>
                                            <TableCell>{product.impuesto}%</TableCell>
                                            <TableCell>{product.total?.toFixed(2)}€</TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow>
                                          <TableCell colSpan={4} className="text-right font-medium">Total:</TableCell>
                                          <TableCell className="font-bold">
                                            {selectedRecord.products
                                              .reduce((sum: number, product: any) => sum + (product.total || 0), 0)
                                              .toFixed(2)}€
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                
                                {selectedRecord.transcripcion && (
                                  <div>
                                    <label className="text-sm font-medium">Transcripción</label>
                                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded whitespace-pre-wrap">
                                      {selectedRecord.transcripcion}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
                              deleteRecord(item.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
