import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useFiscal } from '@/hooks/useFiscal';
import { CURRENT_YEAR, MONTHS_IT } from '@/lib/constants';
import { exportBackup, importBackup, exportExcel } from '@/lib/backup';

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

function FiscaleTab({ config, onUpdate }: { config: { id: number; regime: string; profitability_coefficient: number; tax_rate: number; inps_rate: number; revenue_cap_cents: number }; onUpdate: (id: number, data: Record<string, unknown>) => Promise<void> }) {
  const [taxRate, setTaxRate] = useState(config.tax_rate);
  const [inpsRate, setInpsRate] = useState(config.inps_rate);
  const [coefficient, setCoefficient] = useState(config.profitability_coefficient);

  const handleSave = async () => {
    await onUpdate(config.id, {
      tax_rate: taxRate,
      inps_rate: inpsRate,
      profitability_coefficient: coefficient,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Configurazione Fiscale</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Regime</Label>
          <input type="text" value="Forfettario" disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Coefficiente Redditivita' (%)</Label>
            <input type="number" value={coefficient} onChange={(e) => setCoefficient(Number(e.target.value))}
              min={1} max={100}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Aliquota Imposta (%)</Label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
              min={1} max={100}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Aliquota INPS (%)</Label>
            <input type="number" value={inpsRate} onChange={(e) => setInpsRate(Number(e.target.value))}
              min={1} max={100}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Aliquota 5%: primi 5 anni di attivita' (nuova). Aliquota 15%: regime ordinario forfettario.
        </p>
        <div className="pt-4">
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
