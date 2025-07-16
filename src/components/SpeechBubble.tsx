import React, { useState, useEffect } from 'react';

interface SpeechBubbleProps {
  text: string;
  isVisible: boolean;
  onClose?: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, isVisible, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isVisible && text) {
      setIsTyping(true);
      setDisplayedText('');
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
          
          // Auto-close after 5 seconds
          if (onClose) {
            setTimeout(onClose, 5000);
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [text, isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2 max-w-xs z-20">
      <div className="bg-jarvis-grey/90 border border-jarvis-gold/40 rounded-lg p-4 backdrop-blur-sm relative">
        {/* Speech bubble arrow */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
          <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-jarvis-gold/40"></div>
        </div>
        
        <div className="text-jarvis-gold text-sm font-mono">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-2 h-4 bg-jarvis-gold ml-1 animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
};