import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HudCorner } from './HudCorner';
import { SpeechBubble } from './SpeechBubble';
import { CodeStream } from './CodeStream';
import { AudioVisualizer } from './AudioVisualizer';

export const JarvisInterface = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis1');
  const [hasError, setHasError] = useState(false);
  const [status, setStatus] = useState<'standby' | 'listening' | 'processing' | 'speaking'>('standby');
  const [recordingTime, setRecordingTime] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [latency, setLatency] = useState(0);
  const { toast } = useToast();
  const audioRef = useRef<MediaRecorder | null>(null);
  const audioDataRef = useRef<Blob | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

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
    setStatus('standby');
    playActivationSound();
  }, []);

  // Timer para gravação
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const sendToWebhook = async () => {
    if (!audioDataRef.current) return;
    
    if (!webhookUrl) {
      setWebhookUrl(prompt('Configure a URL do webhook:') || '');
      return;
    }

    setHasError(false);
    setIsSpeaking(true);
    setStatus('processing');
    
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('audio', audioDataRef.current);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      const endTime = Date.now();
      setLatency(endTime - startTime);

      if (!response.ok) {
        throw new Error('Webhook failed');
      }

      // Tentar extrair resposta do webhook
      const responseData = await response.text();
      setResponseText(responseData || 'Comando processado com sucesso');
      setShowResponse(true);
      setStatus('speaking');

      audioDataRef.current = null;
      
      setTimeout(() => {
        setIsSpeaking(false);
        setStatus('standby');
      }, 3000);

    } catch (error) {
      setIsSpeaking(false);
      setStatus('standby');
      setHasError(true);
      setTimeout(() => setHasError(false), 3000);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Parar gravação e enviar automaticamente
      if (audioRef.current && audioRef.current.state === 'recording') {
        audioRef.current.stop();
      }
      setIsRecording(false);
      setStatus('standby');
      
      // Aguardar um pouco para o áudio ser processado, então enviar
      setTimeout(() => {
        if (audioDataRef.current) {
          playActivationSound();
          sendToWebhook();
        }
      }, 500);
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
          audioDataRef.current = audioBlob;
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStatus('listening');

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
    if (audioRef.current && audioRef.current.state === 'recording') {
      audioRef.current.stop();
    }
    setIsRecording(false);
    setIsSpeaking(false);
    setHasError(false);
    setShowResponse(false);
    setStatus('standby');
    setRecordingTime(0);
    audioDataRef.current = null;
  };

  // Dados para os cantos HUD
  const topLeftData = [
    { label: 'v2.4.7', value: 'ONLINE', status: 'online' as const },
    { label: 'SYS', value: 'OPTIMAL' },
    { label: 'PWR', value: '100%' },
  ];

  const topRightData = [
    { label: 'VOICE', value: status === 'listening' ? 'ACTIVE' : 'STANDBY' },
    { label: 'MIC', value: isRecording ? 'RECORDING' : 'READY' },
    { label: 'CONN', value: 'SECURE', status: 'online' as const },
    { label: 'LATENCY', value: `${latency}ms` },
  ];

  const bottomLeftData = [
    { label: 'AUDIO', value: isRecording ? `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}` : '0:00' },
    { label: 'STATUS', value: status.toUpperCase() },
    { label: 'NEURAL', value: 'ACTIVE', status: 'online' as const },
  ];

  const bottomRightData = [
    { label: 'PROTOCOL', value: 'HTTP/2' },
    { label: 'ENDPOINT', value: 'SECURE' },
    { label: 'RESP.TIME', value: `${latency}ms` },
  ];

  return (
    <div className="min-h-screen bg-jarvis-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* HUD Elements nos Cantos */}
      <HudCorner position="top-left" title="JARVIS" data={topLeftData} />
      <HudCorner position="top-right" data={topRightData} />
      <HudCorner position="bottom-left" data={bottomLeftData} />
      <HudCorner position="bottom-right" data={bottomRightData} />

      {/* Code Streams */}
      <CodeStream isActive={status !== 'standby'} position="left" />
      <CodeStream isActive={status !== 'standby'} position="right" />
      
      {/* Máscara Central */}
      <div className="flex-1 flex items-center justify-center relative">
        
        {/* Circuitos pulsantes quando falando */}
        {isSpeaking && (
          <>
            <div className="absolute top-[30%] left-[38%] w-1 h-8 bg-jarvis-gold/60 rounded-full animate-pulse"></div>
            <div className="absolute top-[30%] right-[38%] w-1 h-8 bg-jarvis-gold/60 rounded-full animate-pulse"></div>
            <div className="absolute top-[25%] left-[45%] w-6 h-1 bg-jarvis-gold/40 rounded-full animate-pulse"></div>
            <div className="absolute top-[25%] right-[45%] w-6 h-1 bg-jarvis-gold/40 rounded-full animate-pulse"></div>
          </>
        )}
        
        {/* Imagem principal do Jarvis */}
        <div className="relative">
          <img 
            src="/lovable-uploads/jarvisironman1.png"
            alt="Jarvis Interface"
            className={`w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] object-contain transition-all duration-500 ${
              isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
            } ${
              isSpeaking ? 'scale-[1.02] animate-jarvis-pulse' : ''
            } ${
              isRecording ? 'brightness-110' : ''
            }`}
          />
          
          {/* Efeito de olhos pulsantes quando ativo */}
          {isActive && (
            <>
              <div className={`absolute top-[35%] left-[42%] w-3 h-2 bg-jarvis-gold-bright rounded-full transition-all duration-300 ${
                status === 'listening' ? 'animate-eyes-glow shadow-jarvis-glow-strong' : 
                status === 'processing' ? 'animate-pulse shadow-jarvis-glow' :
                'animate-pulse opacity-80'
              }`}></div>
              <div className={`absolute top-[35%] right-[42%] w-3 h-2 bg-jarvis-gold-bright rounded-full transition-all duration-300 ${
                status === 'listening' ? 'animate-eyes-glow shadow-jarvis-glow-strong' : 
                status === 'processing' ? 'animate-pulse shadow-jarvis-glow' :
                'animate-pulse opacity-80'
              }`}></div>
            </>
          )}
          
          {/* Speech Bubble */}
          <SpeechBubble 
            text={responseText} 
            isVisible={showResponse} 
            onClose={() => setShowResponse(false)}
          />
        </div>
      </div>

      {/* Controles de Microfone */}
      <div className="flex flex-col items-center space-y-6 pb-8">
        
        {/* Botão principal de microfone */}
        <div className="relative">
          <button
            onClick={toggleRecording}
            disabled={isSpeaking}
            className={`
              w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 transition-all duration-300 
              flex items-center justify-center relative group
              ${isRecording 
                ? 'border-jarvis-red bg-jarvis-red/20 text-jarvis-red scale-110 shadow-red-glow' 
                : isSpeaking
                ? 'border-jarvis-gold/50 bg-jarvis-gold/10 text-jarvis-gold/50 cursor-not-allowed'
                : 'border-jarvis-gold bg-jarvis-gold/20 text-jarvis-gold hover:scale-105 shadow-jarvis-glow'
              }
            `}
          >
            <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
            
            {/* Anel pulsante quando gravando */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-jarvis-red animate-glow-ring"></div>
            )}
            
            {/* Anel de progresso visual quando processando */}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-2 border-jarvis-gold animate-spin-slow opacity-60"></div>
            )}
          </button>
          
          {/* Audio Visualizer */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <AudioVisualizer isActive={isRecording || isSpeaking} isRecording={isRecording} />
          </div>
        </div>
        
        {/* Status e informações */}
        <div className="text-center space-y-2">
          <div className="text-xs sm:text-sm font-mono">
            {isRecording && (
              <p className="text-jarvis-red">
                ● REC {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </p>
            )}
            {isSpeaking && (
              <p className="text-jarvis-gold animate-typing-dots">
                PROCESSANDO
              </p>
            )}
            {status === 'standby' && !isRecording && !isSpeaking && (
              <p className="text-jarvis-gold/70">
                CLIQUE PARA ATIVAR
              </p>
            )}
          </div>
          
          {/* Reset button pequeno */}
          {(audioDataRef.current || isRecording || isSpeaking) && (
            <button
              onClick={resetConversation}
              className="text-xs text-jarvis-gold/50 hover:text-jarvis-gold transition-colors"
            >
              [RESET]
            </button>
          )}
        </div>
      </div>

      {/* Status de erro */}
      {hasError && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-jarvis-red text-xs font-mono animate-pulse px-4 py-2 bg-jarvis-red/10 rounded border border-jarvis-red/30">
          [ERROR] FALHA NA COMUNICAÇÃO
        </div>
      )}
    </div>
  );
};