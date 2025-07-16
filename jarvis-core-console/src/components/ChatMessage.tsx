import { useState, useEffect } from 'react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isUser) {
      setIsAnimating(true);
      setDisplayedContent('');
      
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= content.length) {
          setDisplayedContent(content.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsAnimating(false);
        }
      }, 30);

      return () => clearInterval(typeInterval);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isUser]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} mb-4`}>
      <div 
        className={`
          max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl relative
          ${isUser 
            ? 'bg-jarvis-red/20 border border-jarvis-red/30 text-jarvis-red backdrop-blur-sm' 
            : 'bg-jarvis-gold/10 border border-jarvis-gold/30 text-jarvis-gold backdrop-blur-sm'
          }
          transition-all duration-300 hover:shadow-lg
          ${isUser ? 'hover:shadow-red-glow' : 'hover:shadow-jarvis-glow'}
        `}
      >
        <p className="text-sm leading-relaxed">
          {displayedContent}
          {isAnimating && (
            <span className="inline-block w-2 h-4 bg-jarvis-gold animate-pulse ml-1" />
          )}
        </p>
        
        <div className={`
          text-xs mt-2 opacity-60
          ${isUser ? 'text-jarvis-red/70' : 'text-jarvis-gold/70'}
        `}>
          {formatTime(timestamp)}
        </div>
        
        {/* Message indicator */}
        <div className={`
          absolute top-3 ${isUser ? '-left-2' : '-right-2'}
          w-4 h-4 rotate-45 
          ${isUser 
            ? 'bg-jarvis-red/20 border-l border-b border-jarvis-red/30' 
            : 'bg-jarvis-gold/10 border-r border-t border-jarvis-gold/30'
          }
        `} />
      </div>
    </div>
  );
}