"use client"

import { useState, useEffect, useCallback } from 'react';

// A guard to ensure we have a stable list of voices
const getVoicesPromise = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
};

export function useSpeechSynthesis() {
  const [isReady, setIsReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // This effect ensures the voices are loaded before we allow speaking
    getVoicesPromise().then((voices) => {
      if (voices.length > 0) setIsReady(true);
    });
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text || !isReady || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech synthesis not ready or text is empty.");
      return;
    }

    // Always cancel previous speech to prevent overlaps or stuck states
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = await getVoicesPromise();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es-ES')) || voices.find(voice => voice.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      console.warn("No se encontró una voz en español. Usando la voz por defecto.");
    }
    
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isReady]);

  return { speak, speaking, isReady };
}
