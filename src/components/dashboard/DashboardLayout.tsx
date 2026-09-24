import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, CalendarRange, ChefHat, Radio, LogOut, Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-obsidian border-b border-steel">
        <div>
          <h1 className="font-cinzel font-bold text-parchment text-sm tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
            Ritter XXL
          </h1>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
          className="text-parchment p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-obsidian border-r border-steel flex flex-col transform transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex-shrink-0`}
      >
        <div className="px-6 py-6 border-b border-steel flex items-center justify-between">
          <div>
            <h1 className="font-cinzel font-bold text-parchment text-sm tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Ritter XXL
            </h1>
            <p className="font-inter text-xs text-parchment/40 mt-0.5">Mitarbeiterbereich</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Menü schließen"
            className="md:hidden text-parchment/60 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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

      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
