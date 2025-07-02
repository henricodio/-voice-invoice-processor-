"use client"

import { useState, useEffect } from "react"
import DocumentTypeSelector from "@/components/document-type-selector"
import { ConversationalForm } from "@/components/conversational-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const [documentType, setDocumentType] = useState<"cliente" | "factura" | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSelectDocumentType = (type: "cliente" | "factura") => {
    setDocumentType(type)
  }

  const handleConversationComplete = async (data: Record<string, any>) => {
    console.log("Datos a guardar:", data)
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, type: documentType }),
      });
      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }
    } catch (error) {
      console.error("Fallo al guardar los datos:", error);
    }
  }

  const handleBack = () => {
    setDocumentType(null)
  }

  if (!isMounted) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="w-full h-96" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {!documentType ? (
        <DocumentTypeSelector onSelect={handleSelectDocumentType} />
      ) : (
        <ConversationalForm 
          documentType={documentType} 
          onComplete={handleConversationComplete} 
          onBack={handleBack}
        />
      )}
    </div>
  )
}
