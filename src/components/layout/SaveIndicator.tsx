import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { SaveStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all z-50',
        status === 'saving' && 'bg-blue-50 text-blue-600',
        status === 'saved' && 'bg-green-50 text-green-600',
        status === 'error' && 'bg-red-50 text-red-600'
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Salvataggio...
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3" />
          Salvato
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3" />
          Errore salvataggio
        </>
      )}
    </div>
  );
}
