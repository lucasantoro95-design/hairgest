import { MONTHS_IT } from '@/lib/constants';

interface MonthYearSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  yearRange?: [number, number];
}

export function MonthYearSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
  yearRange = [2024, 2030],
}: MonthYearSelectorProps) {
  const years = Array.from(
    { length: yearRange[1] - yearRange[0] + 1 },
    (_, i) => yearRange[0] + i
  );

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {MONTHS_IT.map((name, idx) => (
          <option key={idx} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
