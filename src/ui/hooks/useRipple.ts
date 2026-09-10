/**
 * useRipple Hook
 * Creates ripple effect on touch/click interactions
 */

import { useCallback } from 'react';

export const useRipple = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  enabled: boolean = true
) => {
  const createRipple = useCallback(
    (event: React.MouseEvent<T> | React.TouchEvent<T>) => {
      if (!enabled || !ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();

      // Get coordinates from mouse or touch event
      let clientX: number;
      let clientY: number;

      if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      // Calculate ripple size and position
      const size = Math.max(element.clientWidth, element.clientHeight);
      const x = clientX - rect.left - size / 2;
      const y = clientY - rect.top - size / 2;

      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Remove existing ripple
      const existingRipple = element.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      // Add new ripple and remove after animation
      element.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    },
    [enabled, ref]
  );

  return { createRipple };
};

export default useRipple;
