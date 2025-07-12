import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSwipe } from '@/hooks/use-swipe';
import { motion, AnimatePresence } from 'framer-motion';
import { modalTransition } from '@/lib/animations'; // Assuming modalTransition is suitable

interface PhotoCarouselProps {
  images: string[];
  projectTitle: string;
  className?: string;
}

export function PhotoCarousel({ images, projectTitle, className }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle swipe gestures
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => nextImage(),
    onSwipeRight: () => previousImage(),
    threshold: 50,
  });

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (!images || images.length === 0) {
    return (
      <div className={cn("bg-gray-100 rounded-lg flex items-center justify-center h-64", className)}>
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Carousel */}
      <div className={cn("relative bg-gray-100 rounded-lg overflow-hidden group", className)} {...swipeHandlers}>
        {/* Main Image */}
        <div className="relative aspect-[16/12] sm:aspect-[16/10] lg:aspect-[16/9]">
          <img
            src={images[currentIndex]}
            alt={`${projectTitle} - Imagen ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              console.error('Error loading image:', images[currentIndex]);
              setIsLoading(false);
            }}
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-caribbean"></div>
            </div>
          )}

          {/* Fullscreen button */}
          <Button
            onClick={() => setIsFullscreen(true)}
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
          >
            <ZoomIn size={16} />
          </Button>

          {/* Navigation arrows - only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <Button
                onClick={previousImage}
                variant="secondary"
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                disabled={images.length <= 1}
              >
                <ChevronLeft size={20} />
              </Button>
              
              <Button
                onClick={nextImage}
                variant="secondary"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                disabled={images.length <= 1}
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail dots - only show if more than 1 image */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200 scale-[0.0625]",
                  currentIndex === index
                    ? "bg-white scale-[0.078125]"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalTransition} // Using the same modal transition
            {...swipeHandlers}
          >
            {/* Close button */}
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-[51] bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm p-2 h-auto" // Adjusted padding & z-index
            >
              <X size={20} />
            </Button>

            {/* Navigation arrows in fullscreen */}
            {images.length > 1 && (
              <>
                <Button
                  onClick={previousImage}
                  variant="secondary"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-[51] bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm p-3" // Adjusted padding
                >
                  <ChevronLeft size={24} />
                </Button>

                <Button
                  onClick={nextImage}
                  variant="secondary"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-[51] bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm p-3" // Adjusted padding
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}

            {/* Fullscreen image container (for centering) */}
            <div className="max-w-7xl w-full h-full flex items-center justify-center">
              {/* AnimatePresence for image transitions within fullscreen - can be added later if desired */}
              <img
                src={images[currentIndex]}
                alt={`${projectTitle} - Imagen ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain block" // ensure it's a block for layout
                onError={(e) => {
                  console.error('Error loading fullscreen image:', images[currentIndex]);
                }}
              />
            </div>

            {/* Fullscreen image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-2 rounded text-sm backdrop-blur-sm z-[51]">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Fullscreen thumbnail dots - Kept simple for now, could be animated too */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex space-x-2 z-[51]">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-200", // Slightly larger dots
                      currentIndex === index
                        ? "bg-white scale-110"
                        : "bg-white/50 hover:bg-white/75"
                    )}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}