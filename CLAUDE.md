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

## Release: Rilascio Nuova Versione

Quando l'utente dice **"aggiorniamo"** (o varianti come "rilascia", "nuova versione", "pubblica aggiornamento"), eseguire questo flusso completo:

### Flusso automatico

1. **Bump versione** — Chiedere all'utente la nuova versione (o proporre patch/minor/major in base ai cambiamenti). Aggiornare la `version` in tutti e 3 i file:
   - `src-tauri/tauri.conf.json`
   - `package.json`
   - `src-tauri/Cargo.toml`

2. **Commit** — Creare un commit con messaggio `Release vX.Y.Z`

3. **Tag** — Creare il tag git: `git tag vX.Y.Z`

4. **Push** — Push del commit e del tag:
   ```bash
   git push && git push --tags
   ```

5. **Verifica** — Controllare che il workflow GitHub Actions si sia avviato:
   ```bash
   gh run list --repo lucasantoro95-design/hairgest --limit 1
   ```

### Dettagli tecnici

- Il workflow `.github/workflows/release.yml` si attiva automaticamente su push di tag `v*`
- Builda per **macOS Apple Silicon (aarch64)** e **macOS Intel (x86_64)**
- Firma gli artefatti con la chiave privata (secrets GitHub: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`)
- `tauri-apps/tauri-action` crea automaticamente la GitHub Release con `latest.json`, `.dmg`, `.app.tar.gz` e `.sig`
- I clienti ricevono la notifica di aggiornamento al prossimo avvio dell'app (`UpdateChecker` in `App.tsx`)
- La chiave privata locale e' in `~/.tauri/hairgest.key` (password: `hairgest2025`)
- Repo GitHub: `lucasantoro95-design/hairgest`

### Build locale con firma (se necessario)

```bash
export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/hairgest.key)"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="hairgest2025"
npx tauri build
```
