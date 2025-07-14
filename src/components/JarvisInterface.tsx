import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Paperclip, History, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { JarvisAvatar } from './JarvisAvatar';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { StatusIndicator } from './StatusIndicator';

type AgentState = 'idle' | 'listening' | 'responding' | 'error';
type ConnectionStatus = 'online' | 'warning' | 'error';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function JarvisInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendToWebhook = async (userMessage: string) => {
    if (!webhookUrl) {
      toast({
        title: "⚠️ Configuração necessária",
        description: "Configure o webhook URL nas configurações primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAgentState('responding');
      setIsTyping(true);
      setConnectionStatus('online');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          timestamp: new Date().toISOString(),
          user_id: 'jarvis-user'
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook retornou erro: ${response.status}`);
      }

      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        addMessage(data.response || data.message || 'Resposta recebida', false);
        setAgentState('idle');
      }, 1000);

    } catch (error) {
      console.error('Erro ao comunicar com webhook:', error);
      setConnectionStatus('error');
      setAgentState('error');
      setIsTyping(false);
      
      toast({
        title: "⚠️ O Jarvis não conseguiu responder. Tente novamente.",
        description: "Verifique sua conexão e o webhook URL.",
        variant: "destructive",
      });

      setTimeout(() => {
        if (agentState === 'error') {
          setAgentState('idle');
          setConnectionStatus('warning');
        }
      }, 3000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    addMessage(userMessage, true);
    
    await sendToWebhook(userMessage);
  };

  const handleVoiceInput = () => {
    setAgentState('listening');
    // Simular captura de voz por 3 segundos
    setTimeout(() => {
      setAgentState('idle');
      toast({
        title: "🎤 Entrada de voz",
        description: "Funcionalidade em desenvolvimento",
      });
    }, 3000);
  };

  const handleFileUpload = () => {
    toast({
      title: "📎 Upload de arquivo",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-16 bg-card border-r border-border transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="jarvis-ghost"
            size="icon"
            onClick={() => toast({ title: "📚 Histórico", description: "Em desenvolvimento" })}
          >
            <History className="h-5 w-5" />
          </Button>
          
          <Button
            variant="jarvis-ghost"
            size="icon"
            onClick={() => {
              const url = prompt("Digite o URL do webhook:");
              if (url) {
                setWebhookUrl(url);
                setConnectionStatus('online');
                toast({ title: "✅ Webhook configurado", description: "Jarvis está pronto!" });
              }
            }}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button
            variant="jarvis-ghost"
            size="icon"
            onClick={() => toast({ title: "🔔 Notificações", description: "Em desenvolvimento" })}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-16 flex flex-col">
        {/* Header com status */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-jarvis-gold">JARVIS</h1>
          </div>
          
          <StatusIndicator status={connectionStatus} />
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Central glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-jarvis-gold/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Jarvis Avatar */}
          <div className="flex justify-center py-8">
            <JarvisAvatar 
              state={agentState}
              isListening={agentState === 'listening'}
              isResponding={agentState === 'responding' || isTyping}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg">Olá, eu sou o JARVIS</p>
                <p className="text-sm">Seu assistente pessoal de IA está pronto para ajudar</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  content={msg.content}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))
            )}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Overlay para foco durante resposta */}
          {agentState === 'responding' && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none" />
          )}
        </div>

        {/* Input Area */}
        <div className="bg-card border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            {/* Voice button */}
            <Button
              type="button"
              size="icon"
              variant="jarvis-red"
              onClick={handleVoiceInput}
              disabled={agentState === 'responding'}
            >
              <Mic className={`h-5 w-5 ${agentState === 'listening' ? 'animate-pulse' : ''}`} />
            </Button>

            {/* Message input */}
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Fale com o Jarvis..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-jarvis-gold focus:ring-jarvis-gold/20"
                disabled={agentState === 'responding'}
              />
            </div>

            {/* File upload button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="border-border hover:bg-jarvis-grey hover:border-jarvis-gold transition-all duration-200"
              onClick={handleFileUpload}
              disabled={agentState === 'responding'}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              variant="jarvis-gold"
              disabled={!message.trim() || agentState === 'responding'}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}