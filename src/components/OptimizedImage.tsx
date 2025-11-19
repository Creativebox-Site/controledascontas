import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  portrait: 'aspect-[3/4]',
  auto: '',
};

/**
 * Componente de imagem otimizada com lazy loading e placeholder
 * 
 * @example
 * <OptimizedImage
 *   src="/assets/cover.jpg"
 *   alt="Dashboard cover"
 *   aspectRatio="video"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  aspectRatio = 'auto',
  objectFit = 'cover'
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };
  
  return (
    <div className={cn(
      "relative overflow-hidden bg-muted",
      aspectRatioClasses[aspectRatio],
      className
    )}>
      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted" />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg 
              className="mx-auto h-12 w-12 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">Imagem não disponível</p>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            `object-${objectFit}`,
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          sizes={sizes}
        />
      )}
    </div>
  );
};
