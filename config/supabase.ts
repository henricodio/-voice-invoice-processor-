import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Leer la URL y la clave anónima desde las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Declarar la variable supabase con el tipo explícito SupabaseClient
let supabase: SupabaseClient<Database>

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('--- SUPABASE_ERROR ---')
  console.error('Error: Las variables de entorno de Supabase no están definidas.')
  console.error('Asegúrate de que el archivo .env.local existe y contiene NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  console.error('----------------------')
  
  // Creamos un cliente falso para evitar que la app se rompa.
  // Usamos 'as SupabaseClient' para forzar el tipo, aunque nuestro mock no sea una implementación completa.
  supabase = { 
    from: () => ({ 
      select: () => ({ 
        data: null, 
        error: { message: 'Supabase no configurado' },
        single: () => ({ data: null, error: { message: 'Supabase no configurado' } })
      }),
      insert: () => ({
        select: () => ({ data: null, error: { message: 'Supabase no configurado' } }),
        single: () => ({ data: null, error: { message: 'Supabase no configurado' } })
      }),
      // Corregido: delete() ahora devuelve un objeto con el método eq() para permitir el encadenamiento.
      delete: () => ({
        eq: () => ({ data: null, error: { message: 'Supabase no configurado' } })
      }),
      eq: () => ({
        select: () => ({ data: null, error: { message: 'Supabase no configurado' } })
      }),
      order: () => ({ data: null, error: { message: 'Supabase no configurado' } })
    }) 
  } as unknown as SupabaseClient;
} else {
  // Si las variables de entorno están definidas, creamos el cliente real.
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Export the typed supabase client
const typedSupabase = supabase as unknown as SupabaseClient<Database>
export default typedSupabase
