import React, { useState, useRef, useEffect } from 'react';
import { Mic, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const JarvisInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis1');
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<MediaRecorder | null>(null);

  // Som de ativação
  const playActivationSound = () => {
    // Criar um som sintético parecido com abertura da máscara
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  useEffect(() => {
    // Ativar interface com som ao carregar
    setIsActive(true);
    playActivationSound();
  }, []);

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
      {/* Máscara Central com Efeitos */}
      <div className="relative mb-16 flex items-center justify-center">
        {/* Círculos pulsantes quando falando */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-pulse"></div>
          </>
        )}
        
        {/* Imagem principal do Jarvis */}
        <img 
          src="/lovable-uploads/dd05e1f7-52c6-4069-8b42-b9d7ec96366c.png"
          alt="Jarvis Interface"
          className={`w-80 h-80 md:w-96 md:h-96 object-contain transition-all duration-700 ${
            isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
          } ${
            isSpeaking ? 'scale-105 animate-pulse' : ''
          } ${
            isListening ? 'brightness-125' : ''
          }`}
          style={{
            filter: `
              ${isListening ? 'drop-shadow(0 0 40px #22c55e) drop-shadow(0 0 80px #16a34a)' : ''}
              ${isSpeaking ? 'drop-shadow(0 0 60px #22c55e) brightness(1.3)' : ''}
              ${!isListening && !isSpeaking ? 'drop-shadow(0 0 20px #22c55e)' : ''}
            `,
          }}
        />
        
        {/* Efeito de olhos pulsantes quando ativo */}
        {isActive && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`w-8 h-2 bg-green-400 rounded-full animate-pulse ${isListening ? 'animate-ping' : ''}`}></div>
          </div>
        )}
        
        {/* Efeito de anel pulsante quando ouvindo */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-spin-slow opacity-60"></div>
        )}
      </div>

      {/* Botões */}
      <div className="flex items-center space-x-12">
        <Button
          variant="outline"
          size="lg"
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full border-2 transition-all duration-500 ${
            isListening 
              ? 'border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/50 animate-pulse' 
              : 'border-green-400 bg-green-400/10 text-green-400 hover:bg-green-400/20 hover:shadow-lg hover:shadow-green-400/30'
          }`}
          disabled={isSpeaking}
        >
          <Mic className="w-10 h-10" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={resetConversation}
          className="w-20 h-20 rounded-full border-2 border-yellow-500 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
        >
          <RotateCcw className="w-10 h-10" />
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