"use client"

import { useEffect } from "react"
import DataTable from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatosPage() {
  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registros Guardados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable />
        </CardContent>
      </Card>
    </div>
  )
}
