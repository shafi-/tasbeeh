/**
 * Glass Card Component
 * Glassmorphism card wrapper with backdrop blur and optional pattern fill
 */

import React from 'react';
import PatternBackdrop from '../decor/PatternBackdrop';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  decorative?: boolean;
  hover?: boolean;
  /** Render the subtle Islamic star pattern inside the card */
  pattern?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  decorative = false,
  hover = false,
  pattern = false,
}) => {
  return (
    <div
      className={`
        glass-card rounded-xl p-6 relative overflow-hidden
        ${decorative ? 'pointer-events-none' : ''}
        ${hover ? 'group hover:shadow-card-lifted transition-shadow duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {pattern && <PatternBackdrop className="absolute inset-0" />}

      {/* Decorative gradient circle */}
      {decorative && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      )}

      {children}
    </div>
  );
};

export default GlassCard;
