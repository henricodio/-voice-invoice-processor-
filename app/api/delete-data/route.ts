import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function DELETE(request: NextRequest) {
  try {
    // Obtener el ID del registro a eliminar de los parámetros de la URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    // Eliminar el registro de Supabase
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error al eliminar de Supabase:", error)
      return NextResponse.json({ error: `Error al eliminar el registro: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando datos:", error)
    return NextResponse.json({ error: "Error al eliminar los datos" }, { status: 500 })
  }
}
