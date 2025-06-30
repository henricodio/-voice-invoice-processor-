"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Upload, Play, Pause, Loader2, Music, Upload as UploadIcon, Square, AlertCircle, Check, RotateCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void
}

export default function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState<"idle" | "recording" | "editing" | "uploading" | "transcribing" | "playing" | "paused">("idle")
  const [isPlaying, setIsPlaying] = useState(false)

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string | "">("")
  const [editableTranscription, setEditableTranscription] = useState("");
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setStatus("recording")
    } catch (err) {
      console.error("Error accessing microphone. Raw error object:", err);
      
      // Attempt to get more details from the error object
      let errorDetails = 'No se pudieron obtener detalles específicos del error.';
      if (err instanceof Error) {
        errorDetails = `Nombre: ${err.name}, Mensaje: ${err.message}`;
      } else {
        try {
          errorDetails = JSON.stringify(err);
        } catch {
          errorDetails = 'El objeto de error no se pudo serializar.';
        }
      }
      console.error("Detalles del error:", errorDetails);

      let description = "Ocurrió un error inesperado al acceder al micrófono.";
      const errorName = (err as any)?.name;

      switch (errorName) {
        case "NotAllowedError":
        case "PermissionDeniedError":
          description = "Permiso para acceder al micrófono denegado. Por favor, habilita el acceso en la configuración de tu navegador.";
          break;
        case "NotFoundError":
        case "DevicesNotFoundError":
          description = "No se encontró ningún micrófono. Asegúrate de que uno esté conectado y funcionando.";
          break;
        case "NotReadableError":
        case "TrackStartError":
          description = "El micrófono no se puede utilizar en este momento, es posible que esté siendo usado por otra aplicación o que haya un problema de hardware.";
          break;
        case "OverconstrainedError":
        case "ConstraintNotSatisfiedError":
          description = "Las restricciones de audio solicitadas no son compatibles con el dispositivo.";
          break;
        default:
          description = `Ocurrió un error inesperado. Revisa la consola del navegador para ver los detalles técnicos: ${errorName || 'desconocido'}`;
          break;
      }

      toast({
        title: "Error de Micrófono",
        description: description,
        variant: "destructive",
      });
      setError(description);
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStatus("idle")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioBlob(file)
      setAudioUrl(URL.createObjectURL(file))
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setStatus("transcribing")

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error en la transcripción")
      }

      const data = await response.json()
      setTranscription(data.transcription)
      setEditableTranscription(data.transcription); // Guardar transcripción para edición
      setStatus("editing"); // Cambiar al nuevo estado de edición
    } catch (err) {
      setError("Error al transcribir el audio. Inténtalo de nuevo.")
      console.error(err)
      setStatus("idle")
      setAudioBlob(null)
      setAudioUrl(null)
    }
  }

  const handleConfirmTranscription = () => {
    onTranscriptionComplete(editableTranscription);
    setStatus("idle");
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription("");
    setEditableTranscription("");
  };

  const handleRetryRecording = () => {
    setStatus("idle");
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription("");
    setEditableTranscription("");
    setError(null);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (status === 'transcribing') {
    return (
      <Card className="w-full p-8 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/20 shadow-lg min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h3 className="text-xl font-semibold">Transcribiendo audio...</h3>
        <p className="text-muted-foreground">Esto puede tardar unos segundos. Por favor, espera.</p>
      </Card>
    )
  }

  if (status === 'editing') {
    return (
      <Card className="w-full p-8 flex flex-col items-center gap-4 border-2 border-primary/20 shadow-lg">
        <h3 className="text-xl font-semibold">Revisa la transcripción</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">Puedes corregir el texto antes de continuar para asegurar la precisión de los datos.</p>
        <textarea
          value={editableTranscription}
          onChange={(e) => setEditableTranscription(e.target.value)}
          className="w-full h-48 p-3 border rounded-md bg-background/50 font-mono text-sm resize-y"
          aria-label="Texto de la transcripción editable"
        />
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <Button onClick={handleConfirmTranscription} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            Confirmar y Continuar
          </Button>
          <Button variant="outline" onClick={handleRetryRecording}>
            <RotateCw className="h-4 w-4 mr-2" />
            Volver a Grabar
          </Button>
        </div>
      </Card>
    )
  }

  // Estado para la animación de ondas de audio
  const [waveforms, setWaveforms] = useState<number[]>(Array(8).fill(20))
  
  // Efecto para animar las ondas de audio durante la grabación
  useEffect(() => {
    if (!isRecording) return
    
    const interval = setInterval(() => {
      setWaveforms(prev => prev.map(() => Math.floor(Math.random() * 40) + 10))
    }, 200)
    
    return () => clearInterval(interval)
  }, [isRecording])
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
            <h3 className="font-semibold flex items-center">
              <Mic className="w-4 h-4 mr-2 text-primary" />
              Grabar Audio
            </h3>
          </div>
          <CardContent className="p-6 pt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-full max-w-[200px] aspect-square">
                <div className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500/10 animate-ping' : 'bg-primary/5'} transition-all duration-300`}></div>
                <div className={`absolute inset-2 rounded-full ${isRecording ? 'bg-red-500/20' : 'bg-primary/10'} transition-all duration-300`}></div>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  size="icon"
                  className={`absolute inset-4 rounded-full w-auto h-auto transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </div>
              
              <div className="w-full">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
                </Button>
              </div>

              {isRecording && (
                <div className="flex items-center justify-center w-full py-2">
                  <div className="flex items-end h-12 space-x-1">
                    {waveforms.map((height, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-red-500 rounded-full transition-all duration-200" 
                        style={{ height: `${height}px` }}
                      ></div>
                    ))}
                  </div>
                  <Badge variant="outline" className="ml-3 bg-red-500/10 text-red-500 border-red-200 dark:border-red-800 animate-pulse">
                    Grabando...
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
            <h3 className="font-semibold flex items-center">
              <UploadIcon className="w-4 h-4 mr-2 text-primary" />
              Subir Archivo
            </h3>
          </div>
          <CardContent className="p-6 pt-6">
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/30 transition-colors">
                <Input 
                  id="audio-file" 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <UploadIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Arrastra un archivo o haz clic aquí</p>
                  <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A</p>
                </div>
              </div>
              
              <Button 
                onClick={() => document.getElementById('audio-file')?.click()}
                variant="outline" 
                className="w-full gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                Seleccionar archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {audioUrl && (
        <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
            <h3 className="font-semibold flex items-center">
              <Music className="w-4 h-4 mr-2 text-primary" />
              Reproducir y Transcribir
            </h3>
          </div>
          <CardContent className="p-6 pt-6">
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-4 mb-2">
                  <Button 
                    onClick={togglePlayback} 
                    variant="outline" 
                    size="icon"
                    className={`rounded-full transition-all ${isPlaying ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="text-sm font-medium">
                    {isPlaying ? "Reproduciendo audio..." : "Listo para reproducir"}
                  </div>
                </div>
                
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onEnded={() => setIsPlaying(false)} 
                  className="w-full" 
                  controls 
                />
              </div>
              
              <Button 
                onClick={transcribeAudio} 
                className="w-full gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Transcribir Audio
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
