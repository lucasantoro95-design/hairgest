import { useMemo } from 'react';
import type { MonthlyData, ProjectionData } from '@/lib/types';
import { calculateProjections } from '@/lib/calculations';

export function useProjections(
  monthlyData: MonthlyData[],
  targetCents: number,
  currentMonth: number
): ProjectionData {
  const projection = useMemo(() => {
    return calculateProjections(monthlyData, targetCents, currentMonth);
  }, [monthlyData, targetCents, currentMonth]);

  return projection;
}
