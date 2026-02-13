import { useEffect, useState, useCallback, useRef } from 'react';
import { check, type Update } from '@tauri-apps/plugin-updater';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Phase = 'idle' | 'available' | 'downloading' | 'done' | 'error';

export function UpdateChecker() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const contentLength = useRef(0);

  const checkForUpdates = useCallback(async () => {
    try {
      const result = await check();
      if (result) {
        setUpdate(result);
        setPhase('available');
      }
    } catch (err) {
      console.log('Update check:', err);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timeout);
  }, [checkForUpdates]);

  const handleUpdate = async () => {
    if (!update) return;
    try {
      setPhase('downloading');
      setProgress(0);
      contentLength.current = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          contentLength.current = event.data.contentLength ?? 0;
          setProgress(0);
        } else if (event.event === 'Progress') {
          if (contentLength.current > 0) {
            setProgress(prev => Math.min(99, prev + (event.data.chunkLength / contentLength.current) * 100));
          }
        } else if (event.event === 'Finished') {
          setProgress(100);
        }
      });

      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento');
      setPhase('error');
    }
  };

  const handleDismiss = () => {
    setPhase('idle');
    setUpdate(null);
    setError('');
  };

  if (phase === 'idle') return null;

  const canClose = phase !== 'downloading';

  return (
    <Dialog open onOpenChange={(o) => { if (!o && canClose) handleDismiss(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {phase === 'available' && 'Aggiornamento Disponibile'}
            {phase === 'downloading' && 'Aggiornamento in corso...'}
            {phase === 'done' && 'Aggiornamento Completato'}
            {phase === 'error' && 'Errore Aggiornamento'}
          </DialogTitle>
          <DialogDescription>
            {phase === 'available' && (
              <>La versione <strong>{update?.version}</strong> e' disponibile. Vuoi aggiornare ora?</>
            )}
            {phase === 'downloading' && 'Download e installazione in corso. Non chiudere l\'app.'}
            {phase === 'done' && 'Aggiornamento installato. Riavvia l\'app per completare.'}
            {phase === 'error' && error}
          </DialogDescription>
        </DialogHeader>

        {phase === 'downloading' && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
          </div>
        )}

        <DialogFooter>
          {phase === 'available' && (
            <>
              <Button variant="outline" onClick={handleDismiss}>Non ora</Button>
              <Button onClick={handleUpdate}>Aggiorna</Button>
            </>
          )}
          {phase === 'done' && (
            <Button onClick={() => { window.location.reload(); }}>Riavvia</Button>
          )}
          {phase === 'error' && (
            <Button variant="outline" onClick={handleDismiss}>Chiudi</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
