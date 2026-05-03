# Changelog

Tutte le modifiche significative a HairGest sono documentate in questo file.
Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),
versioning semantico [SemVer](https://semver.org/lang/it/).

## [1.0.7] - 2026-05-03

### Modificato
- **Riepilogo fiscale piu' preciso**: le spese delle categorie `Affitto` e
  `Finanziamenti` non sono piu' considerate "spese operative" nel calcolo
  dell'utile netto stimato. Restano comunque visibili e tracciate normalmente
  nella pagina Spese e nei report mensili.
- Costante `OPERATING_EXCLUDED_EXPENSE_CATEGORIES` in `lib/constants.ts`
  determina quali categorie escludere.
- `useExpenses` espone `operatingExpensesCents` e `excludedExpensesCents`.
- Excel export: riga "Spese operative" e "Spese escluse" separate.

### Aggiunto
- Step nel modal "Cosa c'è di nuovo" che spiega la modifica.

## [1.0.6] - 2026-05-03

### Aggiunto
- **Modal "Cosa c'è di nuovo"** tutorial-style multi-step (`WhatsNew.tsx`):
  parte automaticamente al primo avvio dopo un aggiornamento. Tracciamento
  via `localStorage` con chiave `hairgest_last_seen_version`. Contenuto
  versione-specifico in `lib/whatsNew.ts`.
- 5 step illustrati per la v1.0.6: overview, Preventivi, calcolo INPS,
  tracciamento F24, configurazione fiscale.

## [1.0.5] - 2026-05-03 (skipped, mai pubblicata ai clienti)

Bozza di staging interna, superata dalla v1.0.6 prima della pubblicazione.

### Modificato
- **Canale "PRIVATO" rinominato in "PREVENTIVI"**. Migrazione automatica
  preserva tutti i record `revenues` esistenti (rename via `UPDATE` sul
  `channel_id` invariato).
- I preventivi **non concorrono al fatturato fiscale** (sono esclusi via
  `FISCAL_EXCLUDED_CHANNELS`).
- Pagina Incassi: 3 KPI primari di pari livello (Totale Incassi,
  Fatturato Fiscale, Preventivi).

### Aggiunto
- **Calcolo fiscale corretto** secondo Circolare INPS n. 14/2026:
  - Contributo fisso annuo (4.521,36 EUR) sempre dovuto, in 4 rate
    trimestrali (18 mag, 20 ago, 16 nov, 16 feb 2027).
  - IVS variabile a scaglioni: 24% sopra il minimale (18.808 EUR),
    25% oltre 56.224 EUR.
  - Riduzione 35% opzionale per forfettari (toggle in Impostazioni).
  - Imposta sostitutiva calcolata su imponibile NETTO = imponibile lordo
    - INPS effettivamente pagato nell'anno (principio di cassa).
- **Tracciamento manuale F24** versati: nuova tabella `tax_payments`,
  hook `useTaxPayments`, sezione dedicata in pagina Fiscale con
  dovuto/pagato/saldo per ogni voce.
- **Configurazione fiscale ampliata**: contributo fisso, minimale, scaglioni
  e aliquote modificabili da Impostazioni > Configurazione Fiscale.
- **Backup automatico DB pre-migrazione**: copia `hairgest.db` →
  `hairgest.db.backup-pre-vX.Y.Z` nella appDataDir prima di toccare lo schema.
- **Workflow GitHub Actions in modalita' staging** (`releaseDraft: true`):
  ogni `git push --tags` crea una bozza, pubblicazione manuale via
  `gh release edit ... --draft=false --latest`.
- Excel export: nuovo sheet "Pagamenti Tasse", sheet "Fiscale" aggiornato
  con calcolo a scaglioni e separazione fatturato/preventivi.

### Migrazione DB
- `ALTER TABLE fiscal_config ADD COLUMN ...` per i nuovi campi INPS.
- `CREATE TABLE tax_payments`.
- `UPDATE revenue_channels SET name = 'PREVENTIVI' WHERE name = 'PRIVATO'`
  (idempotente, edge case `PRIVATO + PREVENTIVI` coesistenti gestito).
- Tutte le operazioni in `runMigrations()` sono **idempotenti** e
  **preservano i dati esistenti**.

## [1.0.4] - 2026-04-19

### Modificato
- Fix configurazione bundle Tauri (`createUpdaterArtifacts: true`,
  `plugins.sql.preload` come array).

## [1.0.2] - 2026-02-14

### Aggiunto
- Firma artefatti updater Tauri con chiave privata.

## [1.0.1] - 2026-02-14

### Aggiunto
- Sistema di update automatico via Tauri updater.

## [1.0.0] - Initial release

- Gestionale Tauri 2 desktop per saloni di parrucchieri italiani.
- React 19 + TypeScript + SQLite.
- 8 pagine: Dashboard, Incassi, Spese, Mensile, Negozio, Fiscale,
  Proiezioni, Impostazioni.
- Regime forfettario (calcolo originale, sostituito in v1.0.5).
- Backup/restore database, export Excel.
