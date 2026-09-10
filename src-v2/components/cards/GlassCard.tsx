/**
 * Glass Card Component
 * Glassmorphism card wrapper with backdrop blur
 */

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  decorative?: boolean;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  decorative = false,
  hover = false,
}) => {
  return (
    <div
      className={`
        glass-card rounded-xl p-6 relative overflow-hidden
        ${decorative ? 'pointer-events-none' : ''}
        ${hover ? 'group hover:shadow-[0px_4px_20px_rgba(27,67,50,0.05)] transition-shadow duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Decorative gradient circle */}
      {decorative && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      )}

      {children}
    </div>
  );
};

export default GlassCard;
