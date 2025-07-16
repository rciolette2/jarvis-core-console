export function TypingIndicator() {
  return (
    <div className="flex justify-end mb-4">
      <div className="bg-jarvis-gold/10 border border-jarvis-gold/30 backdrop-blur-sm rounded-2xl px-4 py-3 relative">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-jarvis-gold/70">Jarvis está digitando</span>
          <div className="flex space-x-1">
            <div 
              className="w-2 h-2 bg-jarvis-gold rounded-full animate-typing-dots"
              style={{ animationDelay: '0ms' }}
            />
            <div 
              className="w-2 h-2 bg-jarvis-gold rounded-full animate-typing-dots"
              style={{ animationDelay: '200ms' }}
            />
            <div 
              className="w-2 h-2 bg-jarvis-gold rounded-full animate-typing-dots"
              style={{ animationDelay: '400ms' }}
            />
          </div>
        </div>
        
        {/* Message indicator */}
        <div className="absolute top-3 -right-2 w-4 h-4 rotate-45 bg-jarvis-gold/10 border-r border-t border-jarvis-gold/30" />
      </div>
    </div>
  );
}