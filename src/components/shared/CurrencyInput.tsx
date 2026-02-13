import { useState, useCallback, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { centsToEuro, euroToCents } from '@/lib/utils';

interface CurrencyInputProps {
  value: number; // cents
  onChange: (cents: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className, disabled }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (value === 0) return '';
    return centsToEuro(value).toFixed(2).replace('.', ',');
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    // Allow only digits, comma, and dot
    raw = raw.replace(/[^\d,.\-]/g, '');
    // Replace dot with comma for display
    raw = raw.replace('.', ',');
    // Only allow one comma
    const parts = raw.split(',');
    if (parts.length > 2) {
      raw = parts[0] + ',' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      raw = parts[0] + ',' + parts[1].slice(0, 2);
    }
    setDisplayValue(raw);

    // Convert to cents
    const numStr = raw.replace(',', '.');
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      onChange(euroToCents(num));
    } else if (raw === '' || raw === '-') {
      onChange(0);
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (value === 0 && displayValue === '') return;
    setDisplayValue(centsToEuro(value).toFixed(2).replace('.', ','));
  }, [value, displayValue]);

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        €
      </span>
    </div>
  );
}
