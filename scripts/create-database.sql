-- Crear tabla para almacenar los datos extraídos del audio
CREATE TABLE IF NOT EXISTS extracted_data (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    fecha DATE,
    categoria VARCHAR(50),
    notas TEXT,
    transcripcion_original TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_extracted_data_nombre ON extracted_data(nombre);
CREATE INDEX IF NOT EXISTS idx_extracted_data_email ON extracted_data(email);
CREATE INDEX IF NOT EXISTS idx_extracted_data_empresa ON extracted_data(empresa);
CREATE INDEX IF NOT EXISTS idx_extracted_data_categoria ON extracted_data(categoria);
CREATE INDEX IF NOT EXISTS idx_extracted_data_fecha ON extracted_data(fecha);

-- Crear tabla para auditoría
CREATE TABLE IF NOT EXISTS audio_transcriptions (
    id SERIAL PRIMARY KEY,
    audio_filename VARCHAR(255),
    transcription TEXT,
    confidence_score DECIMAL(3,2),
    language_code VARCHAR(10) DEFAULT 'es-ES',
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
