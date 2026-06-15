import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ManualEntryModal } from '../../components/ManualEntryModal';

export function Navigation() {
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Counter', icon: '🔢' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/progress', label: 'Progress', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white">
        <div className="max-w-mobile-container mx-auto flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center
                min-h-[44px] min-w-[44px]
                ${isActive ? 'text-emerald-400' : 'text-slate-400'}
                hover:text-slate-200
                transition-colors duration-200
              `}
            >
              <span className="text-2xl" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}

          {/* Manual Entry Button */}
          <button
            onClick={() => setManualEntryOpen(true)}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-200 transition-colors duration-200"
            aria-label="Log manual session"
          >
            <span className="text-2xl" role="img">➕</span>
            <span className="text-xs mt-1">Log</span>
          </button>
        </div>
      </nav>

      <ManualEntryModal
        isOpen={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
      />
    </>
  );
}
