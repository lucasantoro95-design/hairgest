import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DatabaseProvider, useDatabase } from '@/hooks/useDatabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Incassi } from '@/pages/Incassi';
import { Spese } from '@/pages/Spese';
import { Mensile } from '@/pages/Mensile';
import { Negozio } from '@/pages/Negozio';
import { Fiscale } from '@/pages/Fiscale';
import { Proiezioni } from '@/pages/Proiezioni';
import { Impostazioni } from '@/pages/Impostazioni';
import { UpdateChecker } from '@/components/shared/UpdateChecker';
import { WhatsNew } from '@/components/shared/WhatsNew';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { loading, error } = useDatabase();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Inizializzazione database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-lg font-semibold text-destructive">Errore</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <UpdateChecker />
    <WhatsNew />
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incassi" element={<Incassi />} />
          <Route path="/spese" element={<Spese />} />
          <Route path="/mensile" element={<Mensile />} />
          <Route path="/negozio" element={<Negozio />} />
          <Route path="/fiscale" element={<Fiscale />} />
          <Route path="/proiezioni" element={<Proiezioni />} />
          <Route path="/impostazioni" element={<Impostazioni />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}
