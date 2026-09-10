/**
 * Circular Progress Component
 * SVG circle progress indicator with inner content slot
 */

import React from 'react';
import { CircularProgressProps } from '../../types/components';

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 160,
  strokeWidth = 8,
  className = '',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background track */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-surface-variant opacity-50"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-tertiary-container transition-all duration-1000 ease-out progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      {/* Inner content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
};

export default CircularProgress;
