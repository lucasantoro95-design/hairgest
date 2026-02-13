import { useState, useCallback, useRef, useEffect } from 'react';
import type { SaveStatus } from '@/lib/types';

interface UseSaveStatusReturn {
  status: SaveStatus;
  setSaving: () => void;
  setSaved: () => void;
  setError: () => void;
}

export function useSaveStatus(): UseSaveStatusReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const setSaving = useCallback(() => {
    clearTimer();
    setStatus('saving');
  }, [clearTimer]);

  const setSaved = useCallback(() => {
    clearTimer();
    setStatus('saved');
    timerRef.current = setTimeout(() => {
      setStatus('idle');
      timerRef.current = null;
    }, 2000);
  }, [clearTimer]);

  const setError = useCallback(() => {
    clearTimer();
    setStatus('error');
  }, [clearTimer]);

  return { status, setSaving, setSaved, setError };
}
