import { type NextRequest, NextResponse } from "next/server"
import { GOOGLE_APPLICATION_CREDENTIALS, speechToTextConfig } from "@/config/google-credentials"
import { promises as fs } from "fs"

// Función para obtener un token de acceso utilizando las credenciales de la cuenta de servicio
async function getAccessToken() {
  try {
    // Leer el archivo de credenciales
    const credentialsContent = await fs.readFile(GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
    const credentials = JSON.parse(credentialsContent)

    // Crear el JWT para solicitar el token
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT',
      kid: credentials.private_key_id
    }

    const now = Math.floor(Date.now() / 1000)
    const jwtClaim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    // Importar la biblioteca necesaria para firmar el JWT
    const { SignJWT } = await import('jose')
    const privateKey = credentials.private_key

    // Crear y firmar el JWT
    const importedKey = await import('crypto').then(crypto => 
      crypto.createPrivateKey(privateKey)
    )

    const jwt = await new SignJWT(jwtClaim)
      .setProtectedHeader(jwtHeader)
      .sign(importedKey)

    // Solicitar el token de acceso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    const tokenData = await tokenResponse.json()
    return tokenData.access_token
  } catch (error) {
    console.error('Error al obtener el token de acceso:', error)
    throw new Error('No se pudo obtener el token de acceso')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No se encontró archivo de audio" }, { status: 400 })
    }

    // Convertir el archivo a base64 para enviarlo a Google Cloud Speech-to-Text
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBytes = Buffer.from(arrayBuffer).toString("base64")

    // Obtener el token de acceso
    const accessToken = await getAccessToken()

    // Configuración para Google Cloud Speech-to-Text
    const speechRequest = {
      config: {
        encoding: "WEBM_OPUS", // Ajustar según el formato del audio
        sampleRateHertz: 48000,
        languageCode: "es-ES", // Español
        enableAutomaticPunctuation: true,
        model: "latest_long",
      },
      audio: {
        content: audioBytes,
      },
    }

    // Llamada a Google Cloud Speech-to-Text API con el token de acceso
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(speechRequest),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en la respuesta de Google Cloud Speech:", errorText)
      throw new Error("Error en la API de Google Cloud Speech")
    }

    const result = await response.json()

    // Extraer la transcripción del resultado
    const transcription = result.results?.map((result: any) => result.alternatives[0]?.transcript).join(" ") || ""

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error("Error en transcripción:", error)
    return NextResponse.json({ error: "Error al transcribir el audio" }, { status: 500 })
  }
}
