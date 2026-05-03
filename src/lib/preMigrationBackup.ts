import { copyFile, exists } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { getDb } from './database';

/**
 * Crea una copia del DB SQLite prima di eseguire migrazioni di schema.
 *
 * Idempotente: se il backup per la versione corrente esiste gia', non fa nulla.
 * Best-effort: se qualcosa fallisce, logga ma NON blocca l'avvio dell'app
 * (le migrazioni del v1.0.5 sono comunque sicure: solo ADD COLUMN e UPDATE su record esistenti).
 *
 * Il file viene salvato come `hairgest.db.backup-pre-vX.Y.Z` nella appDataDir.
 * In caso di problemi col rilascio, il cliente puo' ripristinare manualmente
 * rinominando il file di backup in `hairgest.db`.
 */
export async function preMigrationBackup(): Promise<void> {
  try {
    const version = await getVersion();
    const dataDir = await appDataDir();
    const dbPath = await join(dataDir, 'hairgest.db');
    const backupPath = await join(dataDir, `hairgest.db.backup-pre-v${version}`);

    // Se il DB sorgente non esiste (prima installazione), niente da copiare
    const dbExists = await exists(dbPath);
    if (!dbExists) return;

    // Se il backup per questa versione esiste gia', skip
    const alreadyBackedUp = await exists(backupPath);
    if (alreadyBackedUp) return;

    // Flush WAL al file principale prima di copiare (cosi' il backup contiene tutti i dati)
    try {
      const db = await getDb();
      await db.execute('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch {
      // best-effort
    }

    await copyFile(dbPath, backupPath);
    // eslint-disable-next-line no-console
    console.info(`[HairGest] Pre-migration backup created: ${backupPath}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[HairGest] Pre-migration backup failed (non-fatal):', err);
  }
}
