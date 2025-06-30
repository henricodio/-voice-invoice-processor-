"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id?: string
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  impuesto: number
}

interface ProductFormProps {
  products: Product[]
  onProductsChange: (products: Product[]) => void
}

export default function ProductForm({ products, onProductsChange }: ProductFormProps) {
  const addProduct = () => {
    const newProduct: Product = {
      nombre_producto: "",
      cantidad: 1,
      precio_unitario: 0,
      impuesto: 21, // IVA por defecto en España
    }
    onProductsChange([...products, newProduct])
  }

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = [...products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    }
    onProductsChange(updatedProducts)
  }

  const removeProduct = (index: number) => {
    const updatedProducts = [...products]
    updatedProducts.splice(index, 1)
    onProductsChange(updatedProducts)
  }

  const calculateTotal = (product: Product) => {
    return product.cantidad * product.precio_unitario * (1 + product.impuesto / 100)
  }

  const calculateSubtotal = () => {
    return products.reduce((sum, product) => sum + (product.cantidad * product.precio_unitario), 0)
  }

  const calculateTaxes = () => {
    return products.reduce((sum, product) => {
      return sum + (product.cantidad * product.precio_unitario * (product.impuesto / 100))
    }, 0)
  }

  const calculateGrandTotal = () => {
    return products.reduce((sum, product) => sum + calculateTotal(product), 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Productos de la Factura
          <Button onClick={addProduct} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Producto
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay productos. Haz clic en "Añadir Producto" para comenzar.
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeProduct(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`product-name-${index}`}>Nombre del Producto</Label>
                    <Input
                      id={`product-name-${index}`}
                      value={product.nombre_producto}
                      onChange={(e) => updateProduct(index, "nombre_producto", e.target.value)}
                      placeholder="Ej: Servicio de consultoría"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`product-quantity-${index}`}>Cantidad</Label>
                    <Input
                      id={`product-quantity-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={product.cantidad}
                      onChange={(e) => updateProduct(index, "cantidad", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`product-price-${index}`}>Precio Unitario (€)</Label>
                    <Input
                      id={`product-price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.precio_unitario}
                      onChange={(e) => updateProduct(index, "precio_unitario", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`product-tax-${index}`}>Impuesto (%)</Label>
                    <Input
                      id={`product-tax-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      value={product.impuesto}
                      onChange={(e) => updateProduct(index, "impuesto", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="text-right font-medium">
                  Total: {calculateTotal(product).toFixed(2)}€
                </div>
              </div>
            ))}
            
            {products.length > 0 && (
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{calculateSubtotal().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Impuestos:</span>
                  <span>{calculateTaxes().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold mt-2 text-lg">
                  <span>Total:</span>
                  <span>{calculateGrandTotal().toFixed(2)}€</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
