import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
}

export function BlurImage({ 
  src, 
  alt, 
  className, 
  width, 
  height,
  priority = false,
  onLoad 
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  
  // Generate a low quality placeholder
  const placeholderSrc = src && src.includes('unsplash') 
    ? src.replace(/w=\d+/, 'w=40').replace(/q=\d+/, 'q=10')
    : src || '';

  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    
    // Load high quality image
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    // Priority loading
    if (priority) {
      img.loading = 'eager';
    } else {
      img.loading = 'lazy';
    }

    return () => {
      img.onload = null;
    };
  }, [src, priority, onLoad]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder blur image */}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-110",
            "filter blur-lg",
            isLoaded && "opacity-0"
          )}
          style={{ transition: 'opacity 0.3s ease-out' }}
          aria-hidden="true"
        />
      )}
      
      {/* Main image with animation */}
      <motion.img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "relative w-full h-full object-cover",
          !isLoaded && "opacity-0"
        )}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          scale: isLoaded ? 1 : 1.1 
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
    </div>
  );
}