import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonHover, buttonTap } from '@/lib/animations';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
}

type MotionButtonProps = HTMLMotionProps<"button"> & AnimatedButtonProps;

export const AnimatedButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'right',
    ripple = true,
    children,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-caribbean text-white hover:bg-caribbean/90",
      secondary: "bg-white text-caribbean border-2 border-caribbean hover:bg-caribbean hover:text-white",
      ghost: "bg-transparent text-caribbean hover:bg-caribbean/10"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const rippleElement = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        rippleElement.style.width = rippleElement.style.height = size + 'px';
        rippleElement.style.left = x + 'px';
        rippleElement.style.top = y + 'px';
        rippleElement.classList.add('ripple');
        
        button.appendChild(rippleElement);
        
        setTimeout(() => {
          rippleElement.remove();
        }, 600);
      }
      
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full font-medium transition-all duration-300",
          "flex items-center justify-center gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={!disabled ? buttonHover : {}}
        whileTap={!disabled ? buttonTap : {}}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <motion.span
                initial={{ x: -4, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <motion.span
                initial={{ x: 4, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.span>
            )}
          </>
        )}
        
        <style jsx>{`
          .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
          }
          
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}</style>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';