import React, { useState, useEffect, useCallback } from 'react'
import { Mic, Square, RotateCcw } from 'lucide-react'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import { sendToWebhook }       from '@/utils/api'
import { GridBackground }      from '@/components/GridBackground'
import { JarvisOrb }           from '@/components/JarvisOrb'
import { StatusInfo }          from '@/components/StatusInfo'

const JarvisInterface = () => {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.rcdigitais.com.br/webhook-test/jarvis1');

  // System metrics state
  const [sysStatus, setSysStatus] = useState<'OPTIMAL'|'WARNING'|'ERROR'>('OPTIMAL');
  const [pwr, setPwr] = useState(100);
  const [voiceStatus, setVoiceStatus] = useState<'ACTIVE'|'INACTIVE'>('INACTIVE');
  const [micStatus, setMicStatus] = useState<'STANDBY'|'LISTENING'>('STANDBY');
  const [connStatus, setConnStatus] = useState<'SECURE'|'INSECURE'>('SECURE');
  const [latency, setLatency] = useState(12);

  // Handle audio stop (auto-sends)
  const handleAudioStop = useCallback(async (audioBlob: Blob) => {
    setIsSpeaking(true);
    setVoiceStatus('ACTIVE');
    setMicStatus('STANDBY');
    try {
      await sendToWebhook(audioBlob, webhookUrl);
      setHasError(false);
      setTimeout(() => {
        setIsSpeaking(false);
        setVoiceStatus('INACTIVE');
        setSysStatus('OPTIMAL');
      }, 2000);
    } catch (error: any) {
      setSysStatus('ERROR');
      setHasError(true);
      setIsSpeaking(false);
      toast({
        title: 'Erro de comunicação',
        description: error.message || 'Falha ao enviar áudio.',
        variant: 'destructive',
      });
      setTimeout(() => setHasError(false), 3000);
    }
  }, [webhookUrl, toast]);

  // Handle audio errors
  const handleAudioError = useCallback((error: DOMException) => {
    setSysStatus('ERROR');
    setHasError(true);
    setMicStatus('STANDBY');
    toast({
      title: 'Erro de microfone',
      description: `Não foi possível acessar: ${error.message}`,
      variant: 'destructive',
    });
    setTimeout(() => setHasError(false), 3000);
  }, [toast]);

  // Use custom hook for recording
  const { isRecording, startRecording, stopRecording, clearRecording } = useMediaRecorder({
    onStop: handleAudioStop,
    onError: handleAudioError,
  });

  // Play activation sound once
  useEffect(() => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
  }, []);

  // Update mic status on recording state change
  useEffect(() => {
    if (isRecording) {
      setMicStatus('LISTENING');
      setSysStatus('OPTIMAL');
    } else if (!isSpeaking && !isLocked) {
      setMicStatus('STANDBY');
    }
  }, [isRecording, isSpeaking, isLocked]);

  // Reset conversation
  const resetConversation = () => {
    stopRecording();
    clearRecording();
    setIsSpeaking(false);
    setIsLocked(false);
    setHasError(false);
    setSysStatus('OPTIMAL');
    setVoiceStatus('INACTIVE');
  };

  // Handle send-button toggle for “maintain active”
  const handleToggleLock = () => {
    if (!isLocked) {
      startRecording();
      setIsLocked(true);
    } else {
      stopRecording();
      setIsLocked(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-black">
      <GridBackground />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <JarvisOrb
          isListening={isRecording}
          isSpeaking={isSpeaking}
          isActive={!hasError}
        />
      </div>

      <StatusInfo
        sysStatus={sysStatus}
        pwr={pwr}
        voiceStatus={voiceStatus}
        micStatus={micStatus}
        connStatus={connStatus}
        latency={latency}
      />

      {/* Controls */}
      <div className="absolute bottom-12 flex items-center space-x-6 z-20">
        {/* Mic press-and-hold */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isSpeaking}
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition 
            ${isRecording ? 'bg-red-600 scale-110' : 'bg-gray-800 hover:bg-gray-700'}
            ${isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Mic size={24} className="text-white" />
          {isRecording && <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-30"></div>}
        </button>

        {/* Send-toggle button */}
        <button
          onClick={handleToggleLock}
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition
            ${isLocked ? 'bg-green-600 scale-110 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
          `}
        >
          {isLocked ? <Square size={24} /> : <RotateCcw size={24} />}
        </button>

        {/* Reset */}
        <button
          onClick={resetConversation}
          className="w-12 h-12 rounded-full border border-gray-600 bg-gray-700 flex items-center justify-center hover:bg-gray-600"
        >
          <RotateCcw size={20} className="text-white" />
        </button>
      </div>

      {/* Error status */}
      {hasError && (
        <div className="absolute bottom-4 text-red-500 text-sm animate-fade-in">
          ⚠️ Erro ao se comunicar com Jarvis.
        </div>
      )}
    </div>
  );
};

export default JarvisInterface;