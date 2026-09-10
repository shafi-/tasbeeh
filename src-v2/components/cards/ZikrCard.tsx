/**
 * Zikr Card Component
 * Quick start card for zikr with icon, target count, and start button
 */

import React from 'react';
import MaterialIcon from '../MaterialIcon';
import { ZikrCardProps } from '../../types/components';
import useRipple from '../../hooks/useRipple';
import useHaptic from '../../hooks/useHaptic';

export const ZikrCard: React.FC<ZikrCardProps> = ({
  id,
  name,
  translation,
  targetCount,
  icon,
  onStart,
  completed = false,
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { createRipple } = useRipple(buttonRef);
  const { trigger: haptic } = useHaptic();

  const handleStart = () => {
    haptic('medium');
    onStart(id);
  };

  const handleInteraction = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    createRipple(e);
  };

  const ariaLabel = `Start ${name} practice, ${translation}, target ${targetCount}`;

  return (
    <div className="snap-center shrink-0 w-[75vw] max-w-[280px] bg-surface rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
      {/* Decorative gradient circle */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed/20 rounded-bl-full -mr-4 -mt-4 pointer-events-none"
        aria-hidden="true"
      />

      {/* Header: Icon and target badge */}
      <div className="flex justify-between items-start z-10">
        <div className="bg-surface-container-high p-2 rounded-lg text-primary">
          <MaterialIcon icon={icon} className="text-2xl" />
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded text-sm">
          {targetCount}x
        </span>
      </div>

      {/* Zikr info */}
      <div className="flex flex-col gap-1 z-10 mt-2">
        <h4 className="font-headline-md text-headline-md text-primary text-xl">
          {name}
        </h4>
        <p className="font-caption text-caption text-on-surface-variant">
          {translation}
        </p>
      </div>

      {/* Start button */}
      <button
        ref={buttonRef}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleStart}
        aria-label={ariaLabel}
        aria-pressed={completed}
        className={`
          mt-2 w-full min-h-[56px] rounded-xl
          font-label-md text-label-md
          flex items-center justify-center gap-2
          active-scale-95 transition-transform
          ${completed
            ? 'bg-primary-container text-on-primary'
            : 'bg-surface-container-highest text-primary border border-outline-variant/50'
          }
        `}
      >
        <MaterialIcon icon={completed ? 'check' : 'play_arrow'} className="text-[20px]" />
        {completed ? 'Done' : 'Start'}
      </button>
    </div>
  );
};

export default ZikrCard;
