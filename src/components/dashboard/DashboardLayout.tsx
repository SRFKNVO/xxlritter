import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, CalendarRange, ChefHat, Radio, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Übersicht', icon: LayoutGrid, end: true },
  { to: '/dashboard/tische', label: 'Tisch Reservierungen', icon: UtensilsCrossed, end: false },
  { to: '/dashboard/zimmerkalender', label: 'Zimmerkalender', icon: CalendarRange, end: false },
  { to: '/dashboard/speisekarte', label: 'Speisekarte & Aktionen', icon: ChefHat, end: false },
  { to: '/dashboard/kanaele', label: 'Kanäle', icon: Radio, end: false },
];

export default function DashboardLayout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 flex-shrink-0 bg-obsidian border-r border-steel flex flex-col">
        <div className="px-6 py-6 border-b border-steel">
          <h1 className="font-cinzel font-bold text-parchment text-sm tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
            Ritter XXL
          </h1>
          <p className="font-inter text-xs text-parchment/40 mt-0.5">Mitarbeiterbereich</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-inter transition-colors ${
                  isActive ? 'bg-gold/15 text-gold' : 'text-parchment/70 hover:bg-obsidian-light hover:text-parchment'
                }`
              }
            >
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-steel">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-inter text-parchment/60 hover:bg-obsidian-light hover:text-parchment transition-colors"
          >
            <LogOut size={17} />
            Abmelden
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
