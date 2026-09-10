/**
 * Bottom Navigation Component
 * Mobile bottom navigation bar with active state highlighting
 */

import React from 'react';
import MaterialIcon from '../MaterialIcon';
import { NavItem } from '../../types/components';

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onNavigate,
  className = '',
}) => {
  return (
    <nav
      className={`
        fixed bottom-0 left-0 w-full z-50
        bg-surface rounded-t-xl
        border-t border-outline-variant/20 shadow-sm
        flex justify-around items-center
        h-touch-target-min pb-safe
        px-4 pt-2
        ${className}
      `}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.path)}
            className={`
              flex flex-col items-center justify-center
              px-4 py-1
              rounded-xl
              active-scale-90 transition-transform duration-150
              ${isActive
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-variant/50 group'
              }
            `}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <MaterialIcon
              icon={item.icon}
              filled={isActive}
              className={isActive ? '' : 'group-hover:text-primary transition-colors'}
            />
            <span className="font-label-md text-label-md text-[10px] leading-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
