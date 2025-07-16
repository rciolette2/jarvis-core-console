import React, { useEffect, useState } from 'react';

interface CodeStreamProps {
  isActive: boolean;
  position: 'left' | 'right';
}

export const CodeStream: React.FC<CodeStreamProps> = ({ isActive, position }) => {
  const [lines, setLines] = useState<string[]>([]);

  const codeSnippets = [
    'NEURAL_NET.initialize()',
    'AUDIO_PROC.start()',
    'VOICE_REC.analyze()',
    'NLP.process_intent()',
    'RESPONSE.generate()',
    'SECURITY.validate()',
    'MEMORY.store()',
    'LEARNING.adapt()',
    'PROTOCOL.secure()',
    'SYSTEM.optimize()',
  ];

  useEffect(() => {
    if (!isActive) {
      setLines([]);
      return;
    }

    const interval = setInterval(() => {
      setLines(prev => {
        const newLine = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        const updatedLines = [newLine, ...prev.slice(0, 4)];
        return updatedLines;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive || lines.length === 0) return null;

  return (
    <div className={`absolute top-1/2 ${position === 'left' ? 'left-4' : 'right-4'} transform -translate-y-1/2 z-0`}>
      <div className="space-y-1 opacity-30">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={`text-status-online text-xs font-mono transition-all duration-1000 ${
              index === 0 ? 'opacity-100' : `opacity-${Math.max(20, 100 - index * 20)}`
            }`}
            style={{
              animationDelay: `${index * 200}ms`,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};