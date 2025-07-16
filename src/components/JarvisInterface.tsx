declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

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
    const AudioCtx = (window.AudioContext ?? window.webkitAudioContext) as typeof AudioContext;
    const audioContext = new AudioCtx();
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

    } catch (error: unknown) {
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

      } catch (error: unknown) {
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
    <div className="jarvis-interface">
      <HudCorner data={topLeftData} position="top-left" />
      <HudCorner data={topRightData} position="top-right" />
      <HudCorner data={bottomLeftData} position="bottom-left" />
      <HudCorner data={bottomRightData} position="bottom-right" />
    </div>
  );
}