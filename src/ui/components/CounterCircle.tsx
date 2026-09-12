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
  // Pointer contacts currently down on the button. A "tap" is one gesture:
  // the first contact counts, extra fingers landing while another is still
  // down belong to the same gesture, and the gesture ends when all lift.
  const activePointers = useRef<Set<number>>(new Set());
  const { t } = useI18n();
  const { createRipple } = useRipple(buttonRef, hapticsEnabled);
  const { trigger: haptic } = useHaptic(hapticsEnabled);

  const circumference = 2 * Math.PI * 48; // r=48 from SVG
  const progress = Math.min(count / target, 1);
  const offset = circumference - progress * circumference;
  const isComplete = count >= target;
  const isMilestone = count > 0 && (count % 33 === 0 || isComplete);

  // Count on pointerdown — exactly one event per contact — and only for the
  // first contact of a gesture. The old onTouchStart + onMouseDown pair
  // double-counted on mobile, where browsers fire an emulated mousedown
  // after every tap that isn't prevented. Keyboard is covered by the global
  // Space/Enter listener on the Counter page.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // primary contact only (mouse left / touch / pen)
    if (activePointers.current.has(e.pointerId)) return;
    const isGestureStart = activePointers.current.size === 0;
    activePointers.current.add(e.pointerId);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture is best-effort; pointerup still arrives in normal taps
    }
    if (!isGestureStart) return; // multi-finger part of an already-counted tap

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

  // Gesture bookkeeping: a pointer leaving the set lets the NEXT contact
  // start a new tap. `lostpointercapture` is the safety net for pointers
  // that end without a clean up/cancel.
  const releasePointer = (e: React.PointerEvent<HTMLButtonElement>) => {
    activePointers.current.delete(e.pointerId);
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
        onPointerDown={handlePointerDown}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
        onLostPointerCapture={releasePointer}
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
