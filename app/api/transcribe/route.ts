import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';

// La configuración de las credenciales ahora se obtiene de las variables de entorno
// y no de un archivo local.

// Función para obtener un token de acceso utilizando las credenciales de la cuenta de servicio
async function getAccessToken() {
  try {
    // Construir el objeto de credenciales desde las variables de entorno
    const credentials = {
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // Reemplazar los escapes de nueva línea para que la clave sea válida
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.private_key_id || !credentials.client_email || !credentials.private_key) {
      console.error('Faltan variables de entorno de Google Cloud.');
      throw new Error('Las variables de entorno de Google Cloud no están configuradas correctamente.');
    }

    // Crear el JWT para solicitar el token
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT',
      kid: credentials.private_key_id
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtClaim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Crear y firmar el JWT
    const importedKey = createPrivateKey(credentials.private_key);

    const jwt = await new SignJWT(jwtClaim)
      .setProtectedHeader(jwtHeader)
      .sign(importedKey);

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
    });

    if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Error al solicitar el token de acceso:', errorData);
        throw new Error('No se pudo obtener el token de acceso de Google.');
    }

    console.log("Token de acceso obtenido con éxito.");
    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error en getAccessToken:', error);
    throw new Error('No se pudo obtener el token de acceso.');
  }
}

export async function POST(request: NextRequest) {
  console.log("API de transcripción iniciada.");
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      console.error("No se encontró archivo de audio en la solicitud.");
      return NextResponse.json({ error: "No se encontró archivo de audio" }, { status: 400 });
    }

    console.log(`Archivo de audio recibido, tamaño: ${audioFile.size}, tipo: ${audioFile.type}`);

    // Convertir el archivo a base64 para enviarlo a Google Cloud Speech-to-Text
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString("base64");

    console.log("Archivo de audio convertido a base64.");

    // Obtener el token de acceso
    console.log("Obteniendo token de acceso para la API de Google Cloud.");
    const accessToken = await getAccessToken();

    console.log("Token de acceso obtenido, configurando solicitud a Google Cloud Speech-to-Text.");

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
    };

    console.log("Enviando solicitud a la API de Google Cloud Speech-to-Text.");
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
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la respuesta de Google Cloud Speech:", errorText);
      throw new Error("Error en la API de Google Cloud Speech");
    }

    console.log("Respuesta de la API de Google Cloud Speech exitosa.");

    const result = await response.json();

    // Extraer la transcripción del resultado
    const transcription = result.results?.map((result: any) => result.alternatives[0]?.transcript).join(" ") || "";

    console.log("Transcripción exitosa, devolviendo resultado.");
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error en transcripción:", error);
    return NextResponse.json({ error: "Error al transcribir el audio" }, { status: 500 });
  }
}
