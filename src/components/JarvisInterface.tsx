import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Lock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const JarvisInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis');
  const [hasError, setHasError] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<MediaRecorder | null>(null);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);

  const playActivationSound = () => {
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

      if (!response.ok) throw new Error('Webhook failed');

      setTimeout(() => setIsSpeaking(false), 2000);
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

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendToWebhook(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      toast({
        title: 'Erro de microfone',
        description: 'Não foi possível acessar o microfone',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (audioRef.current && audioRef.current.state === 'recording') audioRef.current.stop();
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
      if (deltaX > 60 && deltaY < 30) {
        setIsDragging(true);
        setIsLocked(true);
        setDragStart(null);
      }
    }
  }, [dragStart, isListening, isLocked]);

  const handleMouseUp = useCallback(() => {
    if (dragStart && isListening && !isLocked) stopRecording();
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
    if (dragStart && isListening && !isLocked) stopRecording();
    setDragStart(null);
    setIsDragging(false);
  }, [dragStart, isListening, isLocked, stopRecording]);

  const resetConversation = () => {
    stopRecording();
    setIsSpeaking(false);
    setHasError(false);
  };

  return null; // The return statement is intentionally left empty as per the original code structure.