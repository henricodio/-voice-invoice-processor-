# Procesador de Facturas por Voz

Esta aplicación te permite procesar facturas y documentos mediante grabaciones de voz, extrayendo información relevante y almacenándola en una base de datos Supabase.

## Índice
1. [Requisitos previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Uso de la aplicación](#uso-de-la-aplicación)
5. [Funcionalidades principales](#funcionalidades-principales)
6. [Solución de problemas](#solución-de-problemas)

## Requisitos previos

- Node.js (versión 16 o superior)
- Cuenta en Supabase (gratuita o de pago)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Instalación

1. Clona el repositorio o descarga los archivos del proyecto
2. Abre una terminal en la carpeta del proyecto
3. Instala las dependencias:

```bash
npm install
# o
yarn install
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

5. Abre tu navegador en `http://localhost:3000`

## Configuración

### Configuración de Supabase

La aplicación ya está configurada con una base de datos Supabase. Los datos de conexión se encuentran en `config/supabase.js`. Si deseas usar tu propia base de datos:

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. En la sección SQL Editor, ejecuta el siguiente script para crear la tabla necesaria:

```sql
CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre text,
    email text,
    telefono text,
    empresa text,
    cargo text,
    fecha text,
    notas text,
    categoria text,
    audio_url text,
    transcripcion text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_invoices_nombre ON public.invoices (nombre);
CREATE INDEX idx_invoices_categoria ON public.invoices (categoria);
CREATE INDEX idx_invoices_email ON public.invoices (email);
CREATE INDEX idx_invoices_fecha ON public.invoices (fecha);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir acceso anónimo (para desarrollo)
CREATE POLICY "Permitir acceso anónimo a invoices" ON public.invoices
    FOR ALL TO anon USING (true) WITH CHECK (true);
```

4. Actualiza los valores en `config/supabase.js` con tu URL y clave anónima:

```javascript
const supabaseUrl = 'TU_URL_DE_SUPABASE'
const supabaseAnonKey = 'TU_CLAVE_ANONIMA'
```

## Uso de la aplicación

### 1. Grabación de voz

1. En la página principal, haz clic en el botón "Grabar"
2. Habla claramente mencionando los detalles de la factura o contacto
3. Haz clic en "Detener" cuando hayas terminado
4. La aplicación transcribirá automáticamente el audio

### 2. Extracción de datos

1. Una vez transcrito el audio, verás el texto en pantalla
2. Haz clic en "Extraer Datos" para que la aplicación identifique automáticamente:
   - Nombre
   - Email
   - Teléfono
   - Empresa
   - Cargo
   - Categoría

3. Revisa y corrige los datos extraídos si es necesario

### 3. Guardado de información

1. Completa cualquier campo adicional que desees
2. Selecciona la categoría adecuada (Cliente, Proveedor, Empleado, etc.)
3. Haz clic en "Guardar Datos"
4. La información se almacenará en la base de datos Supabase

### 4. Visualización y gestión de datos

1. Ve a la pestaña "Datos Extraídos" para ver todos los registros
2. Puedes:
   - Buscar registros usando el campo de búsqueda
   - Ver detalles completos haciendo clic en el icono de ojo
   - Eliminar registros con el icono de papelera
   - Exportar todos los datos a CSV con el botón "Exportar a CSV"

## Funcionalidades principales

### Transcripción de voz
La aplicación utiliza la API de transcripción para convertir el audio en texto. Habla claramente y menciona la información importante para obtener mejores resultados.

### Extracción inteligente
El sistema analiza el texto transcrito e identifica automáticamente:
- Nombres propios
- Direcciones de correo electrónico
- Números de teléfono
- Nombres de empresas
- Cargos o posiciones
- Categorías (cliente, proveedor, etc.)

### Almacenamiento en Supabase
Todos los datos se guardan en una base de datos Supabase, permitiendo:
- Acceso desde cualquier dispositivo
- Búsqueda rápida
- Exportación a CSV
- Gestión completa de registros

## Solución de problemas

### La transcripción no es precisa
- Habla más claramente y despacio
- Reduce el ruido de fondo
- Menciona explícitamente los campos ("El nombre es...", "El email es...")

### Error al guardar datos
- Verifica tu conexión a internet
- Asegúrate de completar al menos el campo "Nombre"
- Si el problema persiste, revisa la consola del navegador para más detalles

### No se muestran los datos guardados
- Haz clic en el icono de actualizar en la tabla
- Verifica que los datos se hayan guardado correctamente
- Comprueba que no haya filtros activos en la búsqueda

---

Para más información o soporte, contacta al administrador del sistema.
