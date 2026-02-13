import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type Database from '@tauri-apps/plugin-sql';
import { getDb, initSchema, isDbSeeded } from '@/lib/database';
import { seedDatabase } from '@/lib/seed';

interface DatabaseContextValue {
  db: Database | null;
  loading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  loading: true,
  error: null,
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await initSchema();

        const seeded = await isDbSeeded();
        if (!seeded) {
          await seedDatabase();
        }

        const database = await getDb();
        if (!cancelled) {
          setDb(database);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, loading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
