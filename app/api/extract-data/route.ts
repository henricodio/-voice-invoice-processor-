import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No se proporcionó texto para procesar" }, { status: 400 })
    }

    // Usar expresiones regulares y procesamiento de texto para extraer datos
    const extractedData = {
      nombre: extractName(text),
      email: extractEmail(text),
      telefono: extractPhone(text),
      empresa: extractCompany(text),
      cargo: extractPosition(text),
      fecha: new Date().toISOString().split("T")[0],
      notas: text,
      categoria: inferCategory(text),
    }

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error("Error extrayendo datos:", error)
    return NextResponse.json({ error: "Error al extraer datos del texto" }, { status: 500 })
  }
}

function extractName(text: string): string {
  // Buscar patrones como "mi nombre es", "me llamo", etc.
  const namePatterns = [
    /(?:mi nombre es|me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
    /nombre[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }

  return ""
}

function extractEmail(text: string): string {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const match = text.match(emailPattern)
  return match ? match[0] : ""
}

function extractPhone(text: string): string {
  const phonePatterns = [/(?:teléfono|celular|móvil)[:\s]*([+]?[\d\s\-()]{10,})/i, /\b[+]?[\d\s\-()]{10,}\b/]

  for (const pattern of phonePatterns) {
    const match = text.match(pattern)
    if (match) return match[1] || match[0]
  }

  return ""
}

function extractCompany(text: string): string {
  const companyPatterns = [
    /(?:trabajo en|empresa|compañía)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/i,
    /(?:de la empresa|en)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/i,
  ]

  for (const pattern of companyPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }

  return ""
}

function extractPosition(text: string): string {
  const positionPatterns = [
    /(?:soy|trabajo como|mi cargo es)[:\s]+([a-záéíóúñ\s]+)/i,
    /(?:gerente|director|coordinador|analista|desarrollador|ingeniero)/i,
  ]

  for (const pattern of positionPatterns) {
    const match = text.match(pattern)
    if (match) return match[1] ? match[1].trim() : match[0]
  }

  return ""
}

function inferCategory(text: string): string {
  const keywords = {
    cliente: ["cliente", "comprar", "producto", "servicio", "cotización"],
    proveedor: ["proveedor", "suministro", "vender", "distribuidor"],
    empleado: ["empleado", "trabajo", "oficina", "equipo", "departamento"],
    contacto: ["contacto", "información", "datos"],
  }

  const lowerText = text.toLowerCase()

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerText.includes(word))) {
      return category
    }
  }

  return "otro"
}
