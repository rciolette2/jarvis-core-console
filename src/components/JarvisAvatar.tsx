import { useEffect, useState } from 'react';

interface JarvisAvatarProps {
  state: 'idle' | 'listening' | 'responding' | 'error';
  isListening: boolean;
  isResponding: boolean;
}

export function JarvisAvatar({ state, isListening, isResponding }: JarvisAvatarProps) {
  const [showGlowRing, setShowGlowRing] = useState(false);

  useEffect(() => {
    if (isListening || isResponding) {
      setShowGlowRing(true);
    } else {
      const timer = setTimeout(() => setShowGlowRing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, isResponding]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated glow rings */}
      {showGlowRing && (
        <>
          <div className="absolute inset-0 rounded-full bg-jarvis-gold/20 animate-glow-ring" />
          <div className="absolute inset-0 rounded-full bg-jarvis-red/10 animate-glow-ring animation-delay-500" />
        </>
      )}
      
      {/* Main avatar container */}
      <div 
        className={`
          relative w-64 h-64 lg:w-80 lg:h-80 transition-all duration-500
          ${isListening ? 'animate-jarvis-pulse' : ''}
          ${isResponding ? 'animate-eyes-glow' : ''}
          ${state === 'error' ? 'filter hue-rotate-180' : ''}
        `}
      >
        {/* Avatar image */}
        <img
          src="/lovable-uploads/c0b24db6-9e1a-4d6c-959e-1a514688a148.png"
          alt="Jarvis AI Assistant"
          className={`
            w-full h-full object-contain transition-all duration-300
            ${isListening ? 'drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]' : ''}
            ${isResponding ? 'drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]' : ''}
            ${state === 'idle' ? 'drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]' : ''}
          `}
        />
        
        {/* Eyes glow effect overlay */}
        {isResponding && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-8 bg-jarvis-gold-bright/80 rounded-full blur-sm animate-pulse" 
                 style={{ transform: 'translateY(-20px)' }} />
          </div>
        )}
        
        {/* Listening pulse overlay */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-jarvis-red/50 animate-ping" />
        )}
        
        {/* Error state overlay */}
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-destructive animate-pulse">⚠️</div>
          </div>
        )}
      </div>
      
      {/* Status text */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-muted-foreground text-center">
          {state === 'idle' && 'Aguardando comando...'}
          {state === 'listening' && 'Ouvindo...'}
          {state === 'responding' && 'Processando...'}
          {state === 'error' && 'Sistema temporariamente indisponível'}
        </p>
      </div>
    </div>
  );
}