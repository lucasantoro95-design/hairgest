# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Vite dev server (localhost:5173) + Tauri dev window
npm run build        # tsc -b && vite build (production frontend)
npx tauri build      # Full release build → .dmg in src-tauri/target/release/bundle/dmg/
npx tauri dev        # Development mode with hot reload
```

**Note:** Cargo is at `~/.cargo/bin/cargo`. PATH may need `export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"` for Tauri builds.

## Architecture

**HairGest** — Tauri 2 desktop app for Italian hair salon business management (revenues, expenses, fiscal regime forfettario).

```
React 19 + TypeScript ──→ Tauri IPC ──→ SQLite (via tauri-plugin-sql)
     │                                       │
     ├── Pages (8 routes)                    └── hairgest.db in appDataDir
     ├── Hooks (data access layer)
     ├── Components (Radix UI + Tailwind 4)
     └── Lib (types, utils, calculations)
```

### Data Flow

Pages → custom hooks (`useRevenues`, `useExpenses`, etc.) → `useDatabase()` context → SQLite queries. Mutations call `db.execute()` then refetch. No Redux — all state is local `useState` + `useMemo` for aggregations.

### Key Directories

- `src/pages/` — Route pages: Dashboard, Incassi, Spese, Mensile, Negozio, Fiscale, Proiezioni, Impostazioni
- `src/hooks/` — Data hooks: useDatabase (provider), useBusinesses, useRevenues, useExpenses, useMonthlyData, useFiscal, useProjections, useSaveStatus
- `src/lib/` — database.ts (schema + getDb singleton), types.ts, constants.ts, utils.ts, calculations.ts, backup.ts
- `src/components/ui/` — Radix primitives (button, dialog, table, select, etc.)
- `src/components/shared/` — KpiCard, DataTable, CurrencyInput, ConfirmDialog
- `src-tauri/` — Rust backend (minimal: plugin registration only)

## Critical Conventions

### Currency: Always Cents

All monetary values stored as **integer cents** in DB and state. Convert only at display:
```typescript
euroToCents(34.50)  // → 3450 (for storage)
centsToEuro(3450)   // → 34.50 (for display)
formatCurrency(3450) // → "34,50 €" (Italian locale)
```

### Database Schema

7 tables, all keyed by `business_id`. Revenues use `month`/`year` integers; expenses use `date` (YYYY-MM-DD string). Schema created in `lib/database.ts:initSchema()`, seeded in `lib/seed.ts`.

### Hook Pattern

Every data hook follows: fetch in `useCallback` → trigger in `useEffect` → mutate with `db.execute()` → call fetch again. Always check `if (!db) return` before queries.

### Tauri Plugins

Registered in `src-tauri/src/lib.rs`: sql, dialog, fs, updater, log. Permissions in `src-tauri/capabilities/default.json`. The `plugins.sql.preload` in `tauri.conf.json` must be an **array** (not object).

### Routing

React Router v7 in `App.tsx`. All pages render inside `<AppLayout>` (Sidebar + Header + Outlet). Default redirect to `/dashboard`.

### Italian UI

All labels, months (`MONTHS_IT`), currency formatting use Italian locale. The fiscal module implements regime forfettario (67% coefficient, 5%/15% tax, 24% INPS).

## Release: Staging + Produzione

Il rilascio è a due stadi: prima si crea una **bozza** (i clienti non la vedono), si testa, e solo dopo si **pubblica** rendendola disponibile a tutti.

Il workflow GitHub Actions ha `releaseDraft: true`: ogni `git push --tags` crea una release in **bozza**. L'endpoint updater (`releases/latest/download/latest.json`) ignora le bozze, quindi i clienti non ricevono nulla finché non si pubblica manualmente.

### Comando "testiamo" — crea bozza per test

Quando l'utente dice **"testiamo"** (o varianti: "facciamo staging", "prepariamo release", "test build"):

1. **Bump versione** — Chiedere all'utente la nuova versione (o proporre patch/minor/major). Aggiornare in 3 file:
   - `src-tauri/tauri.conf.json`
   - `package.json`
   - `src-tauri/Cargo.toml`

2. **Commit** — Messaggio: `Release vX.Y.Z`

3. **Tag + push**:
   ```bash
   git tag vX.Y.Z
   git push && git push --tags
   ```

4. **Verifica workflow**:
   ```bash
   gh run list --repo lucasantoro95-design/hairgest --limit 1
   ```

5. **Comunicare all'utente**: la build è in corso (~10 min). Quando finisce troverà il `.dmg` su https://github.com/lucasantoro95-design/hairgest/releases (sezione "Drafts"). Scarica, testa, poi dice "aggiorniamo" per pubblicare.

### Comando "aggiorniamo" — pubblica la bozza

Quando l'utente dice **"aggiorniamo"** (o varianti: "pubblica", "rilascia ai clienti", "manda l'update"):

1. **Trova la bozza più recente**:
   ```bash
   gh release list --repo lucasantoro95-design/hairgest --limit 5
   ```
   Cercare la riga con stato `Draft`.

2. **Conferma con l'utente** la versione che sta per pubblicare (es. "Pubblico v1.0.5? I clienti riceveranno l'aggiornamento al prossimo avvio").

3. **Pubblica**:
   ```bash
   gh release edit vX.Y.Z --repo lucasantoro95-design/hairgest --draft=false --latest
   ```

4. **Conferma**: gli utenti riceveranno la notifica al prossimo avvio dell'app (`UpdateChecker` in `App.tsx`).

### Rollback — riportare i clienti a una versione precedente

L'updater Tauri **non fa downgrade automatico** (compara le versioni semver e ignora versioni più basse). Per riportare i clienti a una versione vecchia bisogna **ri-rilasciare il vecchio codice con un numero di versione più alto**.

Quando l'utente dice **"rollback a vX.Y.Z"** (o "torniamo a vX.Y.Z", "ripristina vX.Y.Z"):

1. **Conferma versione target** e leggere la versione corrente da `package.json`.
2. **Calcola nuova versione**: bump patch della corrente (es. corrente v1.0.5 → nuova v1.0.6 con codice di v1.0.3).
3. **Checkout del codice vecchio mantenendo la nuova versione**:
   ```bash
   git checkout vX.Y.Z -- . ':!src-tauri/tauri.conf.json' ':!package.json' ':!src-tauri/Cargo.toml'
   ```
   Poi aggiornare i 3 file di versione con il nuovo numero (es. v1.0.6).
4. **Commit**: `Rollback to vX.Y.Z (released as vNEW)`
5. **Tag + push**:
   ```bash
   git tag vNEW && git push && git push --tags
   ```
6. **Testa la bozza** che esce dal workflow (flusso "testiamo")
7. **Pubblica** quando OK (flusso "aggiorniamo")

Per il rollback **lato sviluppatore** (riportare il codice locale indietro) basta `git checkout vX.Y.Z` — non c'è bisogno di tutto il flusso sopra.

### Dettagli tecnici

- Il workflow `.github/workflows/release.yml` si attiva automaticamente su push di tag `v*` con `releaseDraft: true`
- Builda per **macOS Apple Silicon (aarch64)** e **macOS Intel (x86_64)**
- Firma gli artefatti con la chiave privata (secrets GitHub: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`)
- `tauri-apps/tauri-action` crea la release come **bozza** con `latest.json`, `.dmg`, `.app.tar.gz` e `.sig`
- L'endpoint updater (`releases/latest/download/latest.json`) restituisce 404 sulle bozze → clienti non notificati
- Pubblicare la bozza con `gh release edit ... --draft=false --latest` rende `latest.json` accessibile e attiva l'update lato client
- La chiave privata locale è in `~/.tauri/hairgest.key` (password: `hairgest2025`)
- Repo GitHub: `lucasantoro95-design/hairgest`

### Build locale con firma (se necessario)

```bash
export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/hairgest.key)"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="hairgest2025"
npx tauri build
```
