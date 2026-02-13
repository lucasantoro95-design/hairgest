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

Registered in `src-tauri/src/lib.rs`: sql, dialog, fs, log. Permissions in `src-tauri/capabilities/default.json`. The `plugins.sql.preload` in `tauri.conf.json` must be an **array** (not object).

### Routing

React Router v7 in `App.tsx`. All pages render inside `<AppLayout>` (Sidebar + Header + Outlet). Default redirect to `/dashboard`.

### Italian UI

All labels, months (`MONTHS_IT`), currency formatting use Italian locale. The fiscal module implements regime forfettario (67% coefficient, 5%/15% tax, 24% INPS).
