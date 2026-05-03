import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useFiscal } from '@/hooks/useFiscal';
import { CURRENT_YEAR, MONTHS_IT } from '@/lib/constants';
import { exportBackup, importBackup, exportExcel } from '@/lib/backup';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { getVersion } from '@tauri-apps/api/app';

type Tab = 'profilo' | 'fiscale' | 'obiettivi' | 'backup';

export function Impostazioni() {
  const [activeTab, setActiveTab] = useState<Tab>('profilo');
  const { currentBusiness, updateBusiness } = useBusinesses();
  const { config, updateConfig } = useFiscal(currentBusiness?.id ?? 1);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profilo', label: 'Profilo Attivita\'' },
    { key: 'fiscale', label: 'Configurazione Fiscale' },
    { key: 'obiettivi', label: 'Obiettivi' },
    { key: 'backup', label: 'Backup e Dati' },
  ];

  return (
    <div>
      <Header title="Impostazioni" description="Gestisci le impostazioni della tua attivita'" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profilo Tab */}
      {activeTab === 'profilo' && currentBusiness && (
        <ProfileTab business={currentBusiness} onUpdate={updateBusiness} />
      )}

      {/* Fiscale Tab */}
      {activeTab === 'fiscale' && config && (
        <FiscaleTab config={config} onUpdate={updateConfig} />
      )}

      {/* Obiettivi Tab */}
      {activeTab === 'obiettivi' && currentBusiness && (
        <ObiettiviTab business={currentBusiness} onUpdate={updateBusiness} />
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <BackupTab businessId={currentBusiness?.id ?? 1} />
      )}
    </div>
  );
}

function ProfileTab({ business, onUpdate }: { business: { id: number; name: string; owner_name: string; address: string; phone: string; email: string; opening_date: string; purchase_price_cents: number }; onUpdate: (id: number, data: Record<string, unknown>) => Promise<void> }) {
  const [name, setName] = useState(business.name);
  const [ownerName, setOwnerName] = useState(business.owner_name);
  const [address, setAddress] = useState(business.address);
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [openingDate, setOpeningDate] = useState(business.opening_date);
  const [purchasePrice, setPurchasePrice] = useState(business.purchase_price_cents);

  const handleSave = async () => {
    await onUpdate(business.id, {
      name, owner_name: ownerName, address, phone, email,
      opening_date: openingDate, purchase_price_cents: purchasePrice,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Profilo Attivita'</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Attivita'</Label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Proprietario</Label>
            <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Indirizzo</Label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Telefono</Label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Apertura</Label>
            <input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Prezzo Acquisto Attivita'</Label>
            <CurrencyInput value={purchasePrice} onChange={setPurchasePrice} />
          </div>
        </div>
        <div className="pt-4">
          <Button onClick={handleSave}>Salva Modifiche</Button>
        </div>
      </div>
    </div>
  );
}

function FiscaleTab({ config, onUpdate }: {
  config: {
    id: number;
    regime: string;
    profitability_coefficient: number;
    tax_rate: number;
    inps_rate: number;
    revenue_cap_cents: number;
    inps_fixed_annual_cents: number;
    inps_minimale_cents: number;
    inps_scaglione2_threshold_cents: number;
    inps_rate_2: number;
    inps_reduction_35: number;
  };
  onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
}) {
  const [taxRate, setTaxRate] = useState(config.tax_rate);
  const [inpsRate, setInpsRate] = useState(config.inps_rate);
  const [inpsRate2, setInpsRate2] = useState(config.inps_rate_2);
  const [coefficient, setCoefficient] = useState(config.profitability_coefficient);
  const [inpsFixed, setInpsFixed] = useState(config.inps_fixed_annual_cents);
  const [inpsMinimale, setInpsMinimale] = useState(config.inps_minimale_cents);
  const [inpsScaglione2, setInpsScaglione2] = useState(config.inps_scaglione2_threshold_cents);
  const [reduction35, setReduction35] = useState(!!config.inps_reduction_35);

  const handleSave = async () => {
    await onUpdate(config.id, {
      tax_rate: taxRate,
      inps_rate: inpsRate,
      inps_rate_2: inpsRate2,
      profitability_coefficient: coefficient,
      inps_fixed_annual_cents: inpsFixed,
      inps_minimale_cents: inpsMinimale,
      inps_scaglione2_threshold_cents: inpsScaglione2,
      inps_reduction_35: reduction35 ? 1 : 0,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 max-w-3xl">
      <h3 className="text-lg font-semibold mb-1">Configurazione Fiscale</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Default: Circolare INPS n. 14/2026 - gestione artigiani. Modifica i valori se cambiano nei prossimi anni.
      </p>

      <div className="space-y-6">
        {/* Sezione regime */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Regime</h4>
          <div className="space-y-2">
            <Label>Tipo regime</Label>
            <input type="text" value="Forfettario" disabled
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Coefficiente Redditivita' (%)</Label>
              <input type="number" value={coefficient} onChange={(e) => setCoefficient(Number(e.target.value))}
                min={1} max={100}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Codice ATECO parrucchieri: 67%</p>
            </div>
            <div className="space-y-2">
              <Label>Aliquota Imposta Sostitutiva (%)</Label>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
                min={1} max={100}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">5% primi 5 anni, 15% successivi</p>
            </div>
          </div>
        </div>

        {/* Sezione INPS */}
        <div className="space-y-4 border-t border-border pt-6">
          <h4 className="text-sm font-semibold text-foreground">INPS Gestione Artigiani</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contributo fisso annuo</Label>
              <CurrencyInput value={inpsFixed} onChange={setInpsFixed} />
              <p className="text-xs text-muted-foreground">2026: 4.521,36 EUR (in 4 rate trimestrali)</p>
            </div>
            <div className="space-y-2">
              <Label>Reddito minimale</Label>
              <CurrencyInput value={inpsMinimale} onChange={setInpsMinimale} />
              <p className="text-xs text-muted-foreground">2026: 18.808 EUR (coperto dal fisso)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Aliquota IVS 1° scaglione (%)</Label>
              <input type="number" value={inpsRate} onChange={(e) => setInpsRate(Number(e.target.value))}
                min={1} max={100}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Sopra il minimale</p>
            </div>
            <div className="space-y-2">
              <Label>Soglia 2° scaglione</Label>
              <CurrencyInput value={inpsScaglione2} onChange={setInpsScaglione2} />
              <p className="text-xs text-muted-foreground">2026: 56.224 EUR</p>
            </div>
            <div className="space-y-2">
              <Label>Aliquota IVS 2° scaglione (%)</Label>
              <input type="number" value={inpsRate2} onChange={(e) => setInpsRate2(Number(e.target.value))}
                min={1} max={100}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Oltre la soglia</p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reduction35}
                onChange={(e) => setReduction35(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <div>
                <p className="text-sm font-medium">Riduzione contributi 35% (forfettari)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Attiva solo se hai presentato la domanda all'INPS entro il 28 febbraio.
                  La riduzione si applica sia al fisso che al variabile.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button onClick={handleSave}>Salva Configurazione</Button>
        </div>
      </div>
    </div>
  );
}

function ObiettiviTab({ business, onUpdate }: { business: { id: number; annual_target_cents: number }; onUpdate: (id: number, data: Record<string, unknown>) => Promise<void> }) {
  const [annualTarget, setAnnualTarget] = useState(business.annual_target_cents);

  const monthlyTarget = Math.round(annualTarget / 12);

  const handleSave = async () => {
    await onUpdate(business.id, { annual_target_cents: annualTarget });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Obiettivi {CURRENT_YEAR}</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Obiettivo Annuale</Label>
          <CurrencyInput value={annualTarget} onChange={setAnnualTarget} />
        </div>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Obiettivo mensile: <span className="font-medium text-foreground">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(monthlyTarget / 100)}
            </span> / mese
          </p>
        </div>
        <div className="space-y-2">
          <Label>Obiettivi Mensili</Label>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS_IT.map((name, idx) => (
              <div key={idx} className="text-center p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{name}</p>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(monthlyTarget / 100)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4">
          <Button onClick={handleSave}>Salva Obiettivi</Button>
        </div>
      </div>
    </div>
  );
}

function UpdateSection() {
  const [appVersion, setAppVersion] = useState('');
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<Update | null>(null);
  const [phase, setPhase] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    getVersion().then(setAppVersion);
  }, []);

  const handleCheck = useCallback(async () => {
    try {
      setChecking(true);
      setPhase('checking');
      setError('');
      const result = await check();
      if (result) {
        setUpdateAvailable(result);
        setPhase('available');
      } else {
        setUpdateAvailable(null);
        setPhase('idle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il controllo');
      setPhase('error');
    } finally {
      setChecking(false);
    }
  }, []);

  const handleDownload = async () => {
    if (!updateAvailable) return;
    try {
      setPhase('downloading');
      setProgress(0);
      let contentLength = 0;

      await updateAvailable.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          contentLength = event.data.contentLength ?? 0;
          setProgress(0);
        } else if (event.event === 'Progress') {
          if (contentLength > 0) {
            setProgress(prev => Math.min(99, prev + (event.data.chunkLength / contentLength) * 100));
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

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-1">Aggiornamenti</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Versione corrente: <span className="font-medium text-foreground">v{appVersion}</span>
      </p>

      {phase === 'idle' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Nessun aggiornamento trovato. L'app e' aggiornata.</p>
          <Button onClick={handleCheck} disabled={checking}>
            Verifica Aggiornamenti
          </Button>
        </div>
      )}

      {phase === 'checking' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Controllo in corso...
        </div>
      )}

      {phase === 'available' && updateAvailable && (
        <div className="space-y-3">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-400">
            Nuova versione disponibile: <strong>v{updateAvailable.version}</strong>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload}>Scarica e Installa</Button>
            <Button variant="outline" onClick={handleCheck}>Ricontrolla</Button>
          </div>
        </div>
      )}

      {phase === 'downloading' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Download e installazione in corso. Non chiudere l'app.</p>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-3">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            Aggiornamento installato con successo!
          </div>
          <Button onClick={() => window.location.reload()}>Riavvia App</Button>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-3">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
          <Button variant="outline" onClick={handleCheck}>Riprova</Button>
        </div>
      )}
    </div>
  );
}

function BackupTab({ businessId }: { businessId: number }) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [confirmRestore, setConfirmRestore] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

  const handleExportExcel = async () => {
    try {
      setStatus({ type: 'loading', message: 'Generazione Excel in corso...' });
      const saved = await exportExcel(selectedYear, businessId);
      if (saved) {
        setStatus({ type: 'success', message: 'File Excel esportato con successo!' });
      } else {
        setStatus({ type: 'idle' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Errore durante l\'export' });
    }
  };

  const handleBackup = async () => {
    try {
      setStatus({ type: 'loading', message: 'Creazione backup in corso...' });
      const saved = await exportBackup();
      if (saved) {
        setStatus({ type: 'success', message: 'Backup creato con successo!' });
      } else {
        setStatus({ type: 'idle' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Errore durante il backup' });
    }
  };

  const handleRestore = async () => {
    try {
      setStatus({ type: 'loading', message: 'Ripristino in corso...' });
      await importBackup();
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Errore durante il ripristino' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status message */}
      {status.type !== 'idle' && (
        <div className={`rounded-lg p-3 text-sm ${
          status.type === 'loading' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
          status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {status.message}
        </div>
      )}

      {/* Aggiornamenti */}
      <UpdateSection />

      {/* Export Excel */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-1">Export Excel</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Esporta tutti i dati (incassi, spese, riepilogo, fiscale) in un file Excel.
        </p>
        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <Label>Anno</Label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleExportExcel} disabled={status.type === 'loading'}>
            Esporta Excel
          </Button>
        </div>
      </div>

      {/* Backup Database */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-1">Backup Database</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Salva una copia del database nella posizione che preferisci. Il file contiene tutti i dati dell'app.
        </p>
        <Button onClick={handleBackup} disabled={status.type === 'loading'}>
          Crea Backup
        </Button>
      </div>

      {/* Ripristina Backup */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-1">Ripristina Backup</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Seleziona un file di backup (.db) per ripristinare i dati. I dati attuali verranno sostituiti.
        </p>
        <Button
          variant="destructive"
          onClick={() => setConfirmRestore(true)}
          disabled={status.type === 'loading'}
        >
          Ripristina da Backup
        </Button>
      </div>

      {/* Migration info */}
      <div className="bg-muted rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold mb-2">Migrazione su un nuovo Mac</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Crea un backup con il pulsante "Crea Backup" qui sopra</li>
          <li>Copia il file .db sul nuovo Mac (AirDrop, USB, iCloud, ecc.)</li>
          <li>Installa HairGest sul nuovo Mac</li>
          <li>Apri Impostazioni {'>'} Backup e Dati {'>'} Ripristina da Backup</li>
        </ol>
      </div>

      {/* Confirm restore dialog */}
      <ConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="Ripristina Backup"
        description="Tutti i dati attuali verranno sostituiti con quelli del backup selezionato. Questa operazione non puo' essere annullata. Vuoi continuare?"
        confirmLabel="Ripristina"
        variant="destructive"
        onConfirm={handleRestore}
      />
    </div>
  );
}
