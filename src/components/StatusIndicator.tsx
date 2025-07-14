interface StatusIndicatorProps {
  status: 'online' | 'warning' | 'error';
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-status-online';
      case 'warning':
        return 'bg-status-warning';
      case 'error':
        return 'bg-status-error';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Conectado';
      case 'warning':
        return 'Instável';
      case 'error':
        return 'Offline';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusEmoji = () => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'warning':
        return '🟠';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <span className="text-sm">{getStatusEmoji()}</span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {getStatusText()}
      </span>
    </div>
  );
}