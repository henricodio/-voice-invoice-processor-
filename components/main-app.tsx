"use client"

import { useState } from "react"
import DocumentTypeSelector from "@/components/document-type-selector"
import { ConversationalForm } from "@/components/conversational-form"

export default function MainApp() {
  const [documentType, setDocumentType] = useState<"cliente" | "factura" | null>(null)

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
