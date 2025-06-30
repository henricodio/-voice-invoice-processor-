import { createClient } from '@supabase/supabase-js'

// Leer la URL y la clave anónima desde las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén definidas
let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('--- SUPABASE_ERROR ---')
  console.error('Error: Las variables de entorno de Supabase no están definidas.')
  console.error('Asegúrate de que el archivo .env.local existe y contiene NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  console.error('----------------------')
  // Creamos un cliente falso para evitar que la app se rompa en lugares donde se espera que supabase esté definido.
  supabase = { from: () => ({ select: () => ({ data: null, error: { message: 'Supabase no configurado' } }) }) }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export default supabase
