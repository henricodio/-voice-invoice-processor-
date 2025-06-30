import { type NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // El 'tipo' de documento se envía en el cuerpo junto con los datos del formulario.
    const { type, ...data } = body;

    if (!type || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "El tipo de documento y los datos son obligatorios." }, { status: 400 });
    }

    // Preparamos el registro para insertar. Usamos los datos del formulario
    // y añadimos el tipo de documento.
    const recordToInsert = {
      ...data,
      tipo_documento: type,
    };

    // Insertamos en la tabla 'invoices'
    const { data: insertedData, error } = await supabase
      .from("invoices")
      .insert(recordToInsert)
      .select()
      .single(); // Usamos .single() para obtener un único objeto como respuesta

    if (error) {
      console.error("Error al guardar en Supabase:", error);
      return NextResponse.json({ error: `Error al guardar los datos: ${error.message}` }, { status: 500 });
    }

    // Devolvemos el registro guardado
    return NextResponse.json(insertedData);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Error desconocido";
    console.error("Error en la ruta API /api/save-data:", errorMessage);
    return NextResponse.json({ error: "Error interno del servidor.", details: errorMessage }, { status: 500 });
  }
}

// Función GET simplificada para obtener todos los registros
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener datos de Supabase:", error);
      return NextResponse.json({ error: `Error al obtener los datos: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data || []);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Error desconocido";
    console.error("Error obteniendo datos:", errorMessage);
    return NextResponse.json({ error: "Error al obtener los datos" }, { status: 500 });
  }
}