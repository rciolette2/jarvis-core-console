import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, isRecording }) => {
  if (!isActive && !isRecording) return null;

  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`w-1 bg-jarvis-gold/60 transition-all duration-150 ${
            isRecording 
              ? `animate-pulse h-${Math.floor(Math.random() * 6) + 2}` 
              : 'h-2'
          }`}
          style={{
            animationDelay: `${bar * 100}ms`,
          }}
        />
      ))}
    </div>
  );
};