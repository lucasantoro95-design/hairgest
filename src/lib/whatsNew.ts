import type { LucideIcon } from 'lucide-react';
import {
  Sparkles,
  Tag,
  Calculator,
  Receipt,
  Settings as SettingsIcon,
} from 'lucide-react';

export interface WhatsNewStep {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Lista di punti chiave (bullet) opzionale */
  bullets?: string[];
  /** Colore tema per il gradient della card (tailwind color name, es. 'blue', 'purple') */
  accent: 'blue' | 'green' | 'purple' | 'amber' | 'pink';
}

export interface WhatsNewContent {
  version: string;
  steps: WhatsNewStep[];
}

/**
 * Contenuto "Cosa c'e' di nuovo" per ogni versione.
 * Il modal mostra il blocco corrispondente alla versione corrente dell'app
 * (vedi WhatsNew.tsx) la prima volta che l'utente avvia dopo l'aggiornamento.
 */
export const WHATS_NEW: Record<string, WhatsNewContent> = {
  '1.0.6': {
    version: '1.0.6',
    steps: [
      {
        icon: Sparkles,
        accent: 'purple',
        title: 'Una versione pensata per il tuo commercialista',
        description:
          "Abbiamo riscritto il modulo fiscale per essere conforme alla Circolare INPS 14/2026. Ora il calcolo delle tasse e dei contributi e' preciso, con tracciamento dei pagamenti e separazione tra incassi e fatturato fiscale.",
        bullets: [
          'Canale "Privato" rinominato in "Preventivi"',
          'Calcolo INPS corretto a scaglioni',
          'Tracciamento manuale F24 versati',
          'Riduzione 35% per forfettari (opzionale)',
        ],
      },
      {
        icon: Tag,
        accent: 'green',
        title: 'Da "Privato" a "Preventivi"',
        description:
          'Il canale "Privato" si chiama ora "Preventivi". Tutti i tuoi incassi storici sono stati preservati e migrati automaticamente nel nuovo canale.',
        bullets: [
          'I preventivi continuano a essere visibili in Incassi (totale e grafico a torta)',
          'Non concorrono al fatturato fiscale (non si pagano tasse sui preventivi)',
          'Nella pagina Incassi ora vedi 3 KPI primari: Totale, Fatturato Fiscale, Preventivi',
        ],
      },
      {
        icon: Calculator,
        accent: 'blue',
        title: 'Calcolo tasse riscritto da zero',
        description:
          "Il modulo fiscale ora rispecchia esattamente la normativa 2026 per artigiani in regime forfettario. Niente piu' approssimazioni.",
        bullets: [
          'INPS fisso annuo: 4.521,36 EUR (4 rate trimestrali)',
          'IVS variabile a scaglioni: 24% sopra 18.808 EUR, 25% oltre 56.224 EUR',
          'Imposta sostitutiva calcolata sull\'imponibile NETTO (dedotti i contributi pagati)',
          'Visualizzazione di prossima scadenza INPS in evidenza',
        ],
      },
      {
        icon: Receipt,
        accent: 'amber',
        title: 'Tieni traccia di ogni F24',
        description:
          "Vai in Fiscale > Registra Pagamento ogni volta che versi un F24. L'app ti mostra in tempo reale quanto hai pagato, quanto resta da pagare e l'accantonamento residuo.",
        bullets: [
          'Tre categorie: INPS Fisso, INPS Variabile, Imposta Sostitutiva',
          'Saldo residuo per ogni voce, sempre aggiornato',
          'Excel di esportazione include il foglio "Pagamenti Tasse"',
        ],
      },
      {
        icon: SettingsIcon,
        accent: 'pink',
        title: 'Configurabile per il futuro',
        description:
          "In Impostazioni > Configurazione Fiscale trovi tutti i parametri INPS modificabili. L'anno prossimo, quando i numeri cambieranno, basta aggiornarli senza aspettare una nuova release.",
        bullets: [
          'Contributo fisso, minimale, scaglioni e aliquote sono editabili',
          'Toggle "Riduzione 35%": attiva se hai presentato domanda all\'INPS entro il 28 febbraio',
          'Tutti i tuoi dati storici restano intatti, ricalcolati con la nuova formula',
        ],
      },
    ],
  },
};

const STORAGE_KEY = 'hairgest_last_seen_version';

/** Versione gia' vista dall'utente (null se mai aperta dopo aggiornamento) */
export function getLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Marca la versione come "vista" — non mostra piu' il modal per questa versione */
export function markVersionAsSeen(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    // ignore
  }
}

/** Decide se mostrare il modal What's New */
export function shouldShowWhatsNew(currentVersion: string): boolean {
  if (!WHATS_NEW[currentVersion]) return false; // nessun contenuto per questa versione
  const lastSeen = getLastSeenVersion();
  return lastSeen !== currentVersion;
}
