import { Variants } from 'framer-motion';

// Fade in animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Hero text animations
export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.2,
      ease: "easeOut"
    }
  }
};

// Button hover animations
export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const buttonTap = {
  scale: 0.95
};

// Card animations
export const cardHover = {
  y: -8,
  transition: { duration: 0.3, ease: "easeOut" }
};

// Parallax scroll animation
export const parallaxY = (offset: number = 100) => ({
  y: [0, offset],
  transition: { duration: 0 }
});

// Number counter animation
export const counterAnimation = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Image loading animation
export const imageLoadAnimation: Variants = {
  hidden: { opacity: 0, scale: 1.1, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Page transition animations
export const pageTransition = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

// Floating animation for decorative elements
export const float = {
  y: [0, -20, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Gradient animation
export const gradientAnimation = {
  background: [
    "linear-gradient(45deg, #0891b2 0%, #06b6d4 100%)",
    "linear-gradient(45deg, #06b6d4 0%, #0ea5e9 100%)",
    "linear-gradient(45deg, #0ea5e9 0%, #0891b2 100%)"
  ],
  transition: {
    duration: 8,
    repeat: Infinity,
    repeatType: "reverse" as const
  }
};

// Modal transition animations
export const modalTransition: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 10, // Slight upward movement, but mostly scale and fade
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25, // Quicker for modals
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 10,
    transition: {
      duration: 0.15, // Quicker for modals
      ease: "easeIn",
    },
  },
};