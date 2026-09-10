/**
 * Pattern Backdrop Component
 * Subtle 8-pointed star (khatam) Islamic geometric pattern layer.
 * Purely decorative — position it with utility classes (e.g. absolute inset-0).
 */

import React from 'react';

interface PatternBackdropProps {
  /** Additional positioning/size classes */
  className?: string;
  /** green: emerald pattern for parchment surfaces; gold: for dark green surfaces */
  variant?: 'green' | 'gold';
}

export const PatternBackdrop: React.FC<PatternBackdropProps> = ({
  className = '',
  variant = 'green',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`${variant === 'gold' ? 'islamic-pattern-gold' : 'islamic-pattern'} ${className}`}
    />
  );
};

export default PatternBackdrop;
