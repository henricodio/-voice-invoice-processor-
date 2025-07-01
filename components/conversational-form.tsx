import { botScripts, Question } from "@/config/bot-questions";
import { useEffect, useState } from "react";
import { AudioRecorder } from "@/components/audio-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronLeft, Mic, Volume2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

interface ConversationalFormProps {
  documentType: 'factura' | 'cliente';
  onComplete: (data: Record<string, any>) => void;
  onBack: () => void;
}

export function ConversationalForm({ documentType, onComplete, onBack }: ConversationalFormProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    setQuestions(botScripts[documentType]);
  }, [documentType]);

  // Efecto para leer la pregunta actual en voz alta
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const currentQuestionText = questions[currentQuestionIndex].question;
      speak(currentQuestionText);
    }
  }, [currentQuestionIndex, questions, isCompleted, speak]);

  const handleTranscriptionComplete = (transcription: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: transcription };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
      onComplete(newAnswers);
      speak("¡Todos los datos han sido registrados con éxito!");
    }
  };

  if (questions.length === 0) {
    return <div>Cargando...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          {isCompleted ? "Datos Registrados" : `Registro de ${documentType}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {!isCompleted ? (
          <>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-xl text-center font-medium">{currentQuestion.question}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => speak(currentQuestion.question)}
                aria-label="Leer pregunta en voz alta"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>
            <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
            <div className="w-full pt-4">
              <h4 className="font-semibold mb-2">Respuestas:</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {Object.entries(answers).map(([key, value]) => (
                  <li key={key}><strong>{questions.find(q => q.id === key)?.label}:</strong> {value}</li>
                ))}
              </ul>
            </div>
            <Button onClick={onBack} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          </>
        ) : (
          <div className="text-center">
            <Check className="w-16 h-16 mx-auto text-green-500" />
            <p className="text-lg mt-4">¡Todos los datos han sido registrados con éxito!</p>
            <Button onClick={onBack} className="mt-6">
              Registrar otro documento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
