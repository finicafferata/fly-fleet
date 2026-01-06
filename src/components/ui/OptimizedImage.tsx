'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  retryAttempts?: number;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  loading = 'lazy',
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  sizes = '100vw',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.png',
  retryAttempts = 3,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate WebP srcset
  const generateWebPSrcSet = (originalSrc: string) => {
    if (!originalSrc || originalSrc.endsWith('.svg')) return '';
    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const extension = '.webp';
    return [
      `${basePath}-320w${extension} 320w`,
      `${basePath}-640w${extension} 640w`,
      `${basePath}-1024w${extension} 1024w`,
      `${basePath}-1280w${extension} 1280w`,
      `${basePath}-1920w${extension} 1920w`
    ].join(', ');
  };

  // Generate standard srcset
  const generateStandardSrcSet = (originalSrc: string) => {
    if (!originalSrc || originalSrc.endsWith('.svg')) return '';
    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const extension = originalSrc.match(/\.[^/.]+$/)?.[0] || '.jpg';
    return [
      `${basePath}-320w${extension} 320w`,
      `${basePath}-640w${extension} 640w`,
      `${basePath}-1024w${extension} 1024w`,
      `${basePath}-1280w${extension} 1280w`,
      `${basePath}-1920w${extension} 1920w`
    ].join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || typeof window === 'undefined') {
      setIsInView(true);
      return;
    }

    const currentImgRef = imgRef.current;
    if (!currentImgRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observerRef.current.observe(currentImgRef);

    return () => {
      if (observerRef.current && currentImgRef) {
        observerRef.current.unobserve(currentImgRef);
      }
    };
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  // Handle image error with retry logic
  const handleError = () => {
    if (retryCount < retryAttempts) {
      setRetryCount(prev => prev + 1);
      // Retry with a slight delay
      setTimeout(() => {
        setImageSrc(`${src}?retry=${retryCount + 1}`);
      }, 1000 * (retryCount + 1));
    } else {
      setImageError(true);
      if (fallbackSrc && imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
        setRetryCount(0);
      }
    }
    onError?.();
  };

  // Placeholder component
  const PlaceholderDiv = () => (
    <div
      className={clsx(
        'bg-neutral-light animate-pulse flex items-center justify-center',
        className
      )}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
      role="img"
      aria-label={`Loading ${alt}`}
    >
      <svg
        className="w-8 h-8 text-neutral-medium"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  // Error fallback component
  const ErrorFallback = () => (
    <div
      className={clsx(
        'bg-neutral-light border-2 border-dashed border-neutral-medium flex items-center justify-center',
        className
      )}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
      role="img"
      aria-label={`Failed to load image: ${alt}`}
    >
      <div className="text-center p-4">
        <svg
          className="w-8 h-8 text-neutral-medium mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-sm text-neutral-medium">Image unavailable</p>
      </div>
    </div>
  );

  // Don't render the image until it's in view (unless priority)
  if (!isInView) {
    return <PlaceholderDiv />;
  }

  // Show error fallback if image failed to load
  if (imageError && imageSrc === fallbackSrc) {
    return <ErrorFallback />;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className={clsx(
            'absolute inset-0 w-full h-full object-cover filter blur-sm scale-110',
            className
          )}
          aria-hidden="true"
        />
      )}

      {/* Loading placeholder */}
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0">
          <PlaceholderDiv />
        </div>
      )}

      {/* Optimized image with multiple formats */}
      <picture>
        {/* WebP format for wide browser support */}
        {generateWebPSrcSet(src) && (
          <source
            srcSet={generateWebPSrcSet(src)}
            type="image/webp"
            sizes={sizes}
          />
        )}

        {/* Fallback to original format */}
        <img
          ref={imgRef}
          src={imageSrc}
          srcSet={generateStandardSrcSet(src)}
          alt={alt}
          className={clsx(
            'transition-opacity duration-300',
            {
              'opacity-0': !isLoaded,
              'opacity-100': isLoaded,
              'object-cover': objectFit === 'cover',
              'object-contain': objectFit === 'contain',
              'object-fill': objectFit === 'fill',
              'object-none': objectFit === 'none',
              'object-scale-down': objectFit === 'scale-down'
            },
            className
          )}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </picture>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-light/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-primary" />
        </div>
      )}
    </div>
  );
}
