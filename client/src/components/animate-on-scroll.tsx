import { useInView } from 'react-intersection-observer';
import React, { ReactNode } from 'react';

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animationClassName?: string; // Applied when in view
  initialClassName?: string;   // Applied when not in view / initial state
  threshold?: number;
  triggerOnce?: boolean;
  delay?: string; // Tailwind delay class e.g., 'delay-100', 'delay-200'
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  className = '',
  animationClassName = 'opacity-100 translate-y-0',
  initialClassName = 'opacity-0 translate-y-10',
  threshold = 0.1,
  triggerOnce = true,
  delay = '',
}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  });

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${delay} ${
        inView ? animationClassName : initialClassName
      }`}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
