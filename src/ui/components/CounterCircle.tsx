/**
 * Counter Circle Component
 * Large interactive counter button with gold progress ring, pattern fill,
 * milestone glow, and ripple effects
 */

import React, { useRef, useEffect } from 'react';
import useRipple from '../hooks/useRipple';
import useHaptic from '../hooks/useHaptic';
import { useI18n } from '../../core/i18n';

interface CounterCircleProps {
  count: number;
  target: number;
  onIncrement: () => void;
  hapticsEnabled: boolean;
  className?: string;
}

export const CounterCircle: React.FC<CounterCircleProps> = ({
  count,
  target,
  onIncrement,
  hapticsEnabled,
  className = '',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();
  const { createRipple } = useRipple(buttonRef, hapticsEnabled);
  const { trigger: haptic } = useHaptic(hapticsEnabled);

  const circumference = 2 * Math.PI * 48; // r=48 from SVG
  const progress = Math.min(count / target, 1);
  const offset = circumference - progress * circumference;
  const isComplete = count >= target;
  const isMilestone = count > 0 && (count % 33 === 0 || isComplete);

  const handleInteraction = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    createRipple(e);
    onIncrement();

    // Trigger haptic feedback
    if (hapticsEnabled) {
      if (count === target - 1) {
        // Next tap completes the target
        haptic('success');
      } else if (count > 0 && count % 11 === 0) {
        // Milestone
        haptic('light');
      } else {
        haptic('light');
      }
    }
  };

  // Prevent default zooming/scrolling
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    button.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => button.removeEventListener('touchmove', handleTouchMove);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[320px] aspect-square">
      {/* Progress Ring SVG */}
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
        viewBox="0 0 100 100"
      >
        {/* Background track */}
        <circle
          className="stroke-surface-container-high"
          cx={50}
          cy={50}
          fill="none"
          r={48}
          strokeWidth="2"
        />
        {/* Progress circle */}
        <circle
          className="stroke-tertiary-container transition-all duration-300 ease-out"
          cx={50}
          cy={50}
          fill="none"
          r={48}
          strokeWidth={isComplete ? '3.5' : '2'}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      {/* Interactive counter button */}
      <button
        ref={buttonRef}
        onMouseDown={(e) => {
          if (e.button === 0) handleInteraction(e); // Only left click
        }}
        onTouchStart={handleInteraction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInteraction(e as any);
          }
        }}
        className={`
          relative w-[85%] h-[85%] rounded-full
          bg-surface-bright border
          ${isComplete ? 'border-tertiary-container shadow-gold-glow' : isMilestone ? 'border-tertiary-fixed shadow-gold-glow' : 'border-tertiary-fixed/60 shadow-card'}
          flex flex-col items-center justify-center
          overflow-hidden touch-manipulation
          outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 focus:ring-offset-surface
          transition-transform duration-100
          hover:scale-[1.02] active:scale-95
          ${className}
        `}
        aria-label={`Tap to count. ${count} of ${target}`}
      >
        {/* Subtle khatam pattern inside the circle */}
        <div className="islamic-pattern absolute inset-0 rounded-full" aria-hidden="true" />

        <span className="relative font-headline-lg-mobile text-[64px] leading-none font-bold text-primary mb-2 tabular-nums">
          {count}
        </span>
        <span className="relative font-label-md text-label-md text-tertiary tabular-nums">
          {t('counter.ofTarget', { target })}
        </span>
      </button>
    </div>
  );
};

export default CounterCircle;
