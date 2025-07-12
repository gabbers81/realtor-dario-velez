import { useEffect } from 'react';
import { useAnimation, AnimationControls } from 'framer-motion';
import { useInView } from 'framer-motion';
import { MutableRefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useScrollAnimation(
  ref: MutableRefObject<any>,
  options: UseScrollAnimationOptions = {}
): AnimationControls {
  const controls = useAnimation();
  const inView = useInView(ref, {
    amount: options.threshold || 0.1,
    once: options.triggerOnce !== false,
    margin: options.rootMargin || "0px"
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!options.triggerOnce) {
      controls.start('hidden');
    }
  }, [inView, controls, options.triggerOnce]);

  return controls;
}