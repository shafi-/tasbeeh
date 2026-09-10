/**
 * Material Icon Component
 * Renders Material Symbols Outlined icons with FILL variant support
 */

import React from 'react';

interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  weight?: number;
  grade?: number;
  opticalSize?: number;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  filled = false,
  className = '',
  style,
  weight = 400,
  grade = 0,
  opticalSize = 24,
}) => {
  const fontVariationSettings = `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`;

  return (
    <span
      className={`material-symbols-outlined ${filled ? 'icon-filled' : ''} ${className}`}
      style={{ fontVariationSettings, ...style }}
    >
      {icon}
    </span>
  );
};

export default MaterialIcon;
