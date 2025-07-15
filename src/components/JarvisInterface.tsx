import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Lock, Unlock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const JarvisInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis1');
  const [hasError, setHasError] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<MediaRecorder | null>(null);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);

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

  const startRecording = useCallback(async () => {
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

    } catch (error) {
      toast({
        title: "Erro de microfone",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (audioRef.current && audioRef.current.state === 'recording') {
      audioRef.current.stop();
    }
    setIsListening(false);
    setIsLocked(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isListening && !isSpeaking) {
      setDragStart({ x: e.clientX, y: e.clientY });
      setIsDragging(false);
      startRecording();
    }
  }, [isListening, isSpeaking, startRecording]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStart && isListening && !isLocked) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = Math.abs(e.clientY - dragStart.y);
      
      // Se arrastar 60px para a direita, trava a gravação
      if (deltaX > 60 && deltaY < 30) {
        setIsDragging(true);
        setIsLocked(true);
        setDragStart(null);
      }
    }
  }, [dragStart, isListening, isLocked]);

  const handleMouseUp = useCallback(() => {
    if (dragStart && isListening && !isLocked) {
      // Se não foi travado, para a gravação
      stopRecording();
    }
    setDragStart(null);
    setIsDragging(false);
  }, [dragStart, isListening, isLocked, stopRecording]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isListening && !isSpeaking) {
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setIsDragging(false);
      startRecording();
    }
  }, [isListening, isSpeaking, startRecording]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStart && isListening && !isLocked) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = Math.abs(touch.clientY - dragStart.y);
      
      if (deltaX > 60 && deltaY < 30) {
        setIsDragging(true);
        setIsLocked(true);
        setDragStart(null);
      }
    }
  }, [dragStart, isListening, isLocked]);

  const handleTouchEnd = useCallback(() => {
    if (dragStart && isListening && !isLocked) {
      stopRecording();
    }
    setDragStart(null);
    setIsDragging(false);
  }, [dragStart, isListening, isLocked, stopRecording]);

  const resetConversation = () => {
    stopRecording();
    setIsSpeaking(false);
    setHasError(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Máscara Central - Tamanho maior e mais destaque */}
      <div className="relative mb-8 sm:mb-12 md:mb-16 flex items-center justify-center">
        
        {/* Efeitos visuais quando falando - círculos nos pontos da máscara */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping opacity-40">
              <div className="w-full h-full border-4 border-jarvis-gold rounded-full"></div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-jarvis-gold rounded-full animate-pulse opacity-80"></div>
            <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-jarvis-gold rounded-full animate-pulse opacity-80"></div>
            <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-jarvis-gold rounded-full animate-pulse opacity-60"></div>
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-jarvis-gold rounded-full animate-pulse opacity-60"></div>
          </>
        )}
        
        {/* Imagem principal do Jarvis - Maior e sem fundo */}
        <img 
          src="/lovable-uploads/dd05e1f7-52c6-4069-8b42-b9d7ec96366c.png"
          alt="Jarvis Interface"
          className={`w-72 h-72 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] object-contain transition-all duration-700 ${
            isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
          } ${
            isSpeaking ? 'scale-105' : ''
          } ${
            isListening ? 'brightness-110' : ''
          }`}
          style={{
            filter: `
              ${isListening ? 'drop-shadow(0 0 30px hsl(var(--jarvis-gold))) drop-shadow(0 0 60px hsl(var(--jarvis-gold) / 0.5))' : ''}
              ${isSpeaking ? 'drop-shadow(0 0 40px hsl(var(--jarvis-gold))) brightness(1.2)' : ''}
              ${!isListening && !isSpeaking && isActive ? 'drop-shadow(0 0 15px hsl(var(--jarvis-gold) / 0.3))' : ''}
            `,
          }}
        />
        
        {/* Efeito de olhos pulsantes quando ativo */}
        {isActive && (
          <>
            <div className="absolute top-[35%] left-[42%] w-3 h-1 bg-jarvis-gold rounded-full animate-pulse opacity-90"></div>
            <div className="absolute top-[35%] right-[42%] w-3 h-1 bg-jarvis-gold rounded-full animate-pulse opacity-90"></div>
          </>
        )}
        
        {/* Efeito de respiração quando idle */}
        {!isListening && !isSpeaking && isActive && (
          <div className="absolute inset-0 rounded-full border border-jarvis-gold/20 animate-pulse"></div>
        )}
      </div>

      {/* Controles de Microfone */}
      <div className="flex flex-col items-center space-y-6">
        
        {/* Botão principal do microfone com drag to lock */}
        <div className="relative flex items-center">
          
          {/* Indicador de arrastar para travar */}
          {isListening && !isLocked && (
            <div className="absolute right-full mr-4 text-xs text-jarvis-gold/70 animate-pulse flex items-center">
              <span className="hidden sm:inline">Arraste →</span>
              <Lock className="w-3 h-3 ml-1" />
            </div>
          )}
          
          {/* Botão do microfone */}
          <button
            ref={micButtonRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            disabled={isSpeaking}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-300 
              flex items-center justify-center relative overflow-hidden
              touch-none select-none
              ${isListening && !isLocked 
                ? 'border-jarvis-red bg-jarvis-red/20 text-jarvis-red shadow-lg shadow-jarvis-red/50 scale-110' 
                : isLocked
                ? 'border-jarvis-gold bg-jarvis-gold/20 text-jarvis-gold shadow-lg shadow-jarvis-gold/50'
                : 'border-jarvis-gold bg-jarvis-gold/10 text-jarvis-gold hover:bg-jarvis-gold/20 hover:scale-105'
              }
              ${isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isLocked ? <Lock className="w-6 h-6 sm:w-8 sm:h-8" /> : <Mic className="w-6 h-6 sm:w-8 sm:h-8" />}
            
            {/* Efeito de ondas quando gravando */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-30"></div>
            )}
          </button>
          
          {/* Botão de parar quando travado */}
          {isLocked && (
            <button
              onClick={stopRecording}
              className="ml-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-jarvis-red bg-jarvis-red/20 text-jarvis-red hover:bg-jarvis-red/30 transition-all duration-300 flex items-center justify-center"
            >
              <Square className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
            </button>
          )}
        </div>
        
        {/* Instruções sutis */}
        <div className="text-center text-xs sm:text-sm text-jarvis-gold/50 max-w-xs">
          {!isListening && !isSpeaking && !isLocked && (
            <p>Pressione e segure para falar</p>
          )}
          {isListening && !isLocked && (
            <p>Solte para enviar ou arraste → para travar</p>
          )}
          {isLocked && (
            <p>Gravação travada - Clique ⏹ para parar</p>
          )}
          {isSpeaking && (
            <p>Jarvis está processando...</p>
          )}
        </div>
        
        {/* Botão de reset */}
        <button
          onClick={resetConversation}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-jarvis-gold/30 bg-jarvis-gold/5 text-jarvis-gold/70 hover:bg-jarvis-gold/10 hover:text-jarvis-gold transition-all duration-300 flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Status de erro */}
      {hasError && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-jarvis-red text-xs sm:text-sm animate-fade-in px-4 py-2 bg-jarvis-red/10 rounded-lg border border-jarvis-red/20">
          ⚠️ Erro ao se comunicar com Jarvis
        </div>
      )}
    </div>
  );
};