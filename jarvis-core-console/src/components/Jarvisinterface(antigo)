import React, { useState, useRef } from 'react';
import { Mic, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import jarvisMask from '@/assets/jarvis-mask.png';

export const JarvisInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis');
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<MediaRecorder | null>(null);

  const sendToWebhook = async (audioBlob: Blob) => {
    if (!webhookUrl) {
      setWebhookUrl(prompt('Configure a URL do webhook:') || '');
      return;
    }

    setHasError(false);
    setIsSpeaking(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Webhook failed');
      }

      // Simular resposta visual
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);

    } catch (error) {
      setIsSpeaking(false);
      setHasError(true);
      
      setTimeout(() => setHasError(false), 3000);
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      // Parar gravação
      if (audioRef.current) {
        audioRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Iniciar gravação
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          sendToWebhook(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsListening(true);

        // Auto-stop após 10 segundos
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsListening(false);
          }
        }, 10000);

      } catch (error) {
        toast({
          title: "Erro de microfone",
          description: "Não foi possível acessar o microfone",
          variant: "destructive",
        });
      }
    }
  };

  const resetConversation = () => {
    setIsSpeaking(false);
    setIsListening(false);
    setHasError(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Máscara Central */}
      <div className="relative mb-16">
        <img 
          src={jarvisMask} 
          alt="Jarvis Mask"
          className={`w-80 h-96 md:w-96 md:h-[28rem] object-contain transition-all duration-500 ${
            isSpeaking ? 'scale-105 animate-jarvis-pulse' : ''
          } ${
            isListening ? 'animate-eyes-glow' : ''
          }`}
          style={{
            filter: isListening ? 'drop-shadow(0 0 30px #ffd700) drop-shadow(0 0 60px #dc2626)' : 
                    isSpeaking ? 'drop-shadow(0 0 40px #ffd700)' : 
                    'drop-shadow(0 0 15px #ffd700)',
          }}
        />
        
        {/* Efeito de pulsação nas bordas quando ouvindo */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-jarvis-gold animate-glow-ring"></div>
        )}
      </div>

      {/* Botões */}
      <div className="flex items-center space-x-8">
        <Button
          variant={isListening ? "jarvis-red" : "jarvis-ghost"}
          size="lg"
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full transition-all duration-300 ${
            isListening ? 'shadow-red-glow animate-pulse' : 'hover:shadow-jarvis-glow'
          }`}
        >
          <Mic className="w-8 h-8" />
        </Button>

        <Button
          variant="jarvis-gold"
          size="lg"
          onClick={resetConversation}
          className="w-16 h-16 rounded-full hover:shadow-jarvis-glow-strong transition-all duration-300"
        >
          <RotateCcw className="w-8 h-8" />
        </Button>
      </div>

      {/* Erro discreto */}
      {hasError && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-jarvis-red text-sm animate-fade-in">
          ⚠️ Erro ao se comunicar com Jarvis.
        </div>
      )}
    </div>
  );
};