import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const JarvisInterface = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis1');
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<MediaRecorder | null>(null);
  const audioDataRef = useRef<Blob | null>(null);

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

  const sendToWebhook = async () => {
    if (!audioDataRef.current) return;
    
    if (!webhookUrl) {
      setWebhookUrl(prompt('Configure a URL do webhook:') || '');
      return;
    }

    setHasError(false);
    setIsSpeaking(true);
    setHasAudio(false);

    try {
      const formData = new FormData();
      formData.append('audio', audioDataRef.current);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Webhook failed');
      }

      audioDataRef.current = null;
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);

    } catch (error) {
      setIsSpeaking(false);
      setHasError(true);
      setTimeout(() => setHasError(false), 3000);
    }
  };

  const startRecording = async () => {
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
        audioDataRef.current = audioBlob;
        setHasAudio(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      toast({
        title: "Erro de microfone",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRef.current && audioRef.current.state === 'recording') {
      audioRef.current.stop();
    }
    setIsRecording(false);
  };

  const resetConversation = () => {
    stopRecording();
    setIsSpeaking(false);
    setHasError(false);
    setHasAudio(false);
    audioDataRef.current = null;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Máscara Central - Muito maior e sem efeitos de luz */}
      <div className="flex-1 flex items-center justify-center relative">
        
        {/* Efeitos visuais sutis quando falando */}
        {isSpeaking && (
          <>
            <div className="absolute top-[35%] left-[42%] w-2 h-2 bg-jarvis-gold rounded-full animate-pulse"></div>
            <div className="absolute top-[35%] right-[42%] w-2 h-2 bg-jarvis-gold rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-jarvis-gold rounded-full animate-pulse opacity-60"></div>
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-jarvis-gold rounded-full animate-pulse opacity-60"></div>
          </>
        )}
        
        {/* Imagem principal do Jarvis - Tamanho muito maior */}
        <img 
          src="/lovable-uploads/dd05e1f7-52c6-4069-8b42-b9d7ec96366c.png"
          alt="Jarvis Interface"
          className={`w-[85vw] h-[85vw] max-w-[600px] max-h-[600px] object-contain transition-all duration-500 ${
            isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
          } ${
            isSpeaking ? 'scale-[1.02]' : ''
          } ${
            isRecording ? 'brightness-105' : ''
          }`}
        />
        
        {/* Efeito de olhos pulsantes quando ativo - mais sutis */}
        {isActive && !isSpeaking && (
          <>
            <div className="absolute top-[35%] left-[42%] w-2 h-1 bg-jarvis-gold rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-[35%] right-[42%] w-2 h-1 bg-jarvis-gold rounded-full animate-pulse opacity-60"></div>
          </>
        )}
      </div>

      {/* Controles de Microfone - Botões simples */}
      <div className="flex flex-col items-center space-y-4 pb-8">
        
        {/* Botões horizontais */}
        <div className="flex items-center space-x-4">
          
          {/* Botão de gravação */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSpeaking}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-300 
              flex items-center justify-center relative
              ${isRecording 
                ? 'border-jarvis-red bg-jarvis-red/20 text-jarvis-red scale-110' 
                : 'border-jarvis-red/50 bg-jarvis-red/10 text-jarvis-red/70 hover:bg-jarvis-red/20 hover:text-jarvis-red hover:scale-105'
              }
              ${isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
            
            {/* Efeito pulsante quando gravando */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-jarvis-red animate-ping opacity-40"></div>
            )}
          </button>
          
          {/* Botão de enviar */}
          <button
            onClick={sendToWebhook}
            disabled={!hasAudio || isSpeaking}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-300 
              flex items-center justify-center
              ${hasAudio && !isSpeaking
                ? 'border-jarvis-gold bg-jarvis-gold/20 text-jarvis-gold hover:scale-105' 
                : 'border-jarvis-gold/30 bg-jarvis-gold/5 text-jarvis-gold/40 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          {/* Botão de reset */}
          <button
            onClick={resetConversation}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-jarvis-gold/30 bg-jarvis-gold/5 text-jarvis-gold/70 hover:bg-jarvis-gold/10 hover:text-jarvis-gold transition-all duration-300 flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        {/* Status simples */}
        <div className="text-center text-xs sm:text-sm text-jarvis-gold/50">
          {isRecording && <p className="text-jarvis-red">● Gravando...</p>}
          {hasAudio && !isRecording && !isSpeaking && <p className="text-jarvis-gold">Pronto para enviar</p>}
          {isSpeaking && <p className="text-jarvis-gold animate-pulse">Jarvis processando...</p>}
          {!isRecording && !hasAudio && !isSpeaking && <p>Clique no microfone para gravar</p>}
        </div>
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