/**
 * Top App Bar Component
 * Fixed header with back/close button, title, and optional action button
 */

import React from 'react';
import MaterialIcon from '../MaterialIcon';
import { HeaderProps } from '../../types/components';

export const TopAppBar: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showClose = false,
  onBack,
  onClose,
  action,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center h-16 px-container-padding-mobile">
      {/* Left: Back or Close button */}
      {(showBack || showClose) && (
        <button
          onClick={showBack ? onBack : onClose}
          aria-label={showBack ? 'Go back' : 'Close'}
          className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-all w-touch-target-min h-touch-target-min flex items-center justify-center -ml-4"
        >
          <MaterialIcon
            icon={showBack ? 'arrow_back' : 'close'}
            className="text-2xl"
          />
        </button>
      )}

      {/* Center: Title */}
      {title && (
        <h1 className="font-headline-md text-headline-md text-primary font-bold">
          {title}
        </h1>
      )}

      {/* Right: Action button */}
      {action && (
        <button
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          className="text-primary hover:opacity-80 active:scale-95 transition-all w-touch-target-min h-touch-target-min flex items-center justify-center -mr-4"
        >
          <MaterialIcon
            icon={action.icon}
            filled={true}
            className="text-2xl"
          />
        </button>
      )}

      {/* Spacer when no left button */}
      {!showBack && !showClose && <div className="w-touch-target-min -ml-4" />}

      {/* Spacer when no action button */}
      {!action && <div className="w-touch-target-min -mr-4" />}
    </header>
  );
};

export default TopAppBar;
