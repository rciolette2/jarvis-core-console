import React from 'react';

interface HudData {
  label: string;
  value: string;
  status?: 'online' | 'warning' | 'error';
}

interface HudCornerProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  data: HudData[];
  title?: string;
}

export const HudCorner: React.FC<HudCornerProps> = ({ position, data, title }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
    }
  };

  const getTextAlign = () => {
    return position.includes('right') ? 'text-right' : 'text-left';
  };

  return (
    <div className={`absolute ${getPositionClasses()} ${getTextAlign()} z-10 font-mono`}>
      <div className="bg-jarvis-black/80 border border-jarvis-gold/30 rounded-md p-2 backdrop-blur-sm">
        {title && (
          <div className="text-jarvis-gold text-xs font-bold mb-1 tracking-wider">
            {title}
          </div>
        )}
        
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center gap-2 text-xs">
            <span className="text-jarvis-gold/70">{item.label}:</span>
            <span className={`font-bold ${
              item.status === 'online' ? 'text-status-online' :
              item.status === 'warning' ? 'text-status-warning' :
              item.status === 'error' ? 'text-status-error' :
              'text-jarvis-gold'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};