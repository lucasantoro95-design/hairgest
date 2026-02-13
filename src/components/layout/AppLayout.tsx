import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SaveIndicator } from './SaveIndicator';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useSaveStatus } from '@/hooks/useSaveStatus';

export function AppLayout() {
  const { currentBusiness } = useBusinesses();
  const { status } = useSaveStatus();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar businessName={currentBusiness?.name} />
      <main className="flex-1 overflow-y-auto p-6">
        <SaveIndicator status={status} />
        <Outlet />
      </main>
    </div>
  );
}
