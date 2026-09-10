/**
 * Ornament Divider Component
 * Hairline divider with a small 8-pointed star at its center —
 * a refined Islamic flourish for section headers.
 */

import React from 'react';

interface OrnamentDividerProps {
  className?: string;
}

export const OrnamentDivider: React.FC<OrnamentDividerProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-tertiary-container/40 to-tertiary-container/60" />
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        className="text-tertiary-container shrink-0"
        fill="currentColor"
      >
        {/* 8-pointed star: union of two squares */}
        <rect x="6" y="6" width="12" height="12" />
        <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-tertiary-container/40 to-tertiary-container/60" />
    </div>
  );
};

export default OrnamentDivider;
