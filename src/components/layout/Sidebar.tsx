import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Calendar,
  Store,
  Calculator,
  TrendingUp,
  Settings,
  Scissors,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incassi', label: 'Incassi', icon: DollarSign },
  { to: '/spese', label: 'Spese', icon: Receipt },
  { to: '/mensile', label: 'Panoramica Mensile', icon: Calendar },
  { to: '/negozio', label: 'Panoramica Negozio', icon: Store },
  { to: '/fiscale', label: 'Fiscale', icon: Calculator },
  { to: '/proiezioni', label: 'Proiezioni', icon: TrendingUp },
  { to: '/impostazioni', label: 'Impostazioni', icon: Settings },
];

interface SidebarProps {
  businessName?: string;
}

export function Sidebar({ businessName }: SidebarProps) {
  return (
    <aside className="w-64 min-w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">HairGest</h1>
            {businessName && (
              <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                {businessName}
              </p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          HairGest v1.0.0
        </p>
      </div>
    </aside>
  );
}
