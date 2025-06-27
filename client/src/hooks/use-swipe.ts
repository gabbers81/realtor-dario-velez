import { useState, useRef, useCallback, TouchEvent, MouseEvent } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const startPos = useRef<TouchPosition>({ x: 0, y: 0 });
  const endPos = useRef<TouchPosition>({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: TouchEvent) => {
    setIsSwiping(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    endPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping) return;
    
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    endPos.current = { x: touch.clientX, y: touch.clientY };
  }, [isSwiping, preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    
    const deltaX = endPos.current.x - startPos.current.x;
    const deltaY = endPos.current.y - startPos.current.y;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Mouse events for desktop testing
  const onMouseDown = useCallback((e: MouseEvent) => {
    setIsSwiping(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    endPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isSwiping) return;
    endPos.current = { x: e.clientX, y: e.clientY };
  }, [isSwiping]);

  const onMouseUp = useCallback(() => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    
    const deltaX = endPos.current.x - startPos.current.x;
    const deltaY = endPos.current.y - startPos.current.y;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    isSwiping,
  };
}