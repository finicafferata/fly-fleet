'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  role?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  fallbackSrc?: string;
  retryAttempts?: number;
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  quality = 80,
  sizes = '100vw',
  width,
  height,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  crossOrigin,
  referrerPolicy,
  role,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  fallbackSrc = '/images/placeholder.jpg',
  retryAttempts = 3,
  ...props
}: OptimizedImageProps): React.JSX.Element {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs for different formats
  const generateWebPSrcSet = (originalSrc: string) => {
    if (!originalSrc.startsWith('/')) return '';

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

  const generateAVIFSrcSet = (originalSrc: string) => {
    if (!originalSrc.startsWith('/')) return '';

    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const extension = '.avif';

    return [
      `${basePath}-320w${extension} 320w`,
      `${basePath}-640w${extension} 640w`,
      `${basePath}-1024w${extension} 1024w`,
      `${basePath}-1280w${extension} 1280w`,
      `${basePath}-1920w${extension} 1920w`
    ].join(', ');
  };

  const generateStandardSrcSet = (originalSrc: string) => {
    if (!originalSrc.startsWith('/')) return originalSrc;

    const pathParts = originalSrc.split('.');
    if (pathParts.length < 2) return originalSrc;

    const basePath = pathParts.slice(0, -1).join('.');
    const extension = `.${pathParts[pathParts.length - 1]}`;

    return [
      `${basePath}-320w${extension} 320w`,
      `${basePath}-640w${extension} 640w`,
      `${basePath}-1024w${extension} 1024w`,
      `${basePath}-1280w${extension} 1280w`,
      `${basePath}-1920w${extension} 1920w`
    ].join(', ');
  };\n\n  // Intersection Observer for lazy loading\n  useEffect(() => {\n    if (priority || typeof window === 'undefined') {\n      setIsInView(true);\n      return;\n    }\n\n    const currentImgRef = imgRef.current;\n    if (!currentImgRef) return;\n\n    observerRef.current = new IntersectionObserver(\n      (entries) => {\n        entries.forEach((entry) => {\n          if (entry.isIntersecting) {\n            setIsInView(true);\n            observerRef.current?.unobserve(entry.target);\n          }\n        });\n      },\n      {\n        threshold: 0.1,\n        rootMargin: '100px'\n      }\n    );\n\n    observerRef.current.observe(currentImgRef);\n\n    return () => {\n      if (observerRef.current && currentImgRef) {\n        observerRef.current.unobserve(currentImgRef);\n      }\n    };\n  }, [priority]);\n\n  // Handle image load\n  const handleLoad = () => {\n    setIsLoaded(true);\n    setImageError(false);\n    onLoad?.();\n  };\n\n  // Handle image error with retry logic\n  const handleError = () => {\n    if (retryCount < retryAttempts) {\n      setRetryCount(prev => prev + 1);\n      // Retry with a slight delay\n      setTimeout(() => {\n        setImageSrc(`${src}?retry=${retryCount + 1}`);\n      }, 1000 * (retryCount + 1));\n    } else {\n      setImageError(true);\n      if (fallbackSrc && imageSrc !== fallbackSrc) {\n        setImageSrc(fallbackSrc);\n        setRetryCount(0);\n      }\n    }\n    onError?.();\n  };\n\n  // Placeholder component\n  const PlaceholderDiv = () => (\n    <div\n      className={clsx(\n        'bg-neutral-light animate-pulse flex items-center justify-center',\n        className\n      )}\n      style={{\n        width: width || 'auto',\n        height: height || 'auto',\n        aspectRatio: width && height ? `${width}/${height}` : undefined\n      }}\n      role=\"img\"\n      aria-label={`Loading ${alt}`}\n    >\n      <svg\n        className=\"w-8 h-8 text-neutral-medium\"\n        fill=\"none\"\n        stroke=\"currentColor\"\n        viewBox=\"0 0 24 24\"\n        aria-hidden=\"true\"\n      >\n        <path\n          strokeLinecap=\"round\"\n          strokeLinejoin=\"round\"\n          strokeWidth={2}\n          d=\"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\"\n        />\n      </svg>\n    </div>\n  );\n\n  // Error fallback component\n  const ErrorFallback = () => (\n    <div\n      className={clsx(\n        'bg-neutral-light border-2 border-dashed border-neutral-medium flex items-center justify-center',\n        className\n      )}\n      style={{\n        width: width || 'auto',\n        height: height || 'auto',\n        aspectRatio: width && height ? `${width}/${height}` : undefined\n      }}\n      role=\"img\"\n      aria-label={`Failed to load image: ${alt}`}\n    >\n      <div className=\"text-center p-4\">\n        <svg\n          className=\"w-8 h-8 text-neutral-medium mx-auto mb-2\"\n          fill=\"none\"\n          stroke=\"currentColor\"\n          viewBox=\"0 0 24 24\"\n          aria-hidden=\"true\"\n        >\n          <path\n            strokeLinecap=\"round\"\n            strokeLinejoin=\"round\"\n            strokeWidth={2}\n            d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z\"\n          />\n        </svg>\n        <p className=\"text-sm text-neutral-medium\">Image unavailable</p>\n      </div>\n    </div>\n  );\n\n  // Don't render the image until it's in view (unless priority)\n  if (!isInView) {\n    return <PlaceholderDiv />;\n  }\n\n  // Show error fallback if image failed to load\n  if (imageError && imageSrc === fallbackSrc) {\n    return <ErrorFallback />;\n  }\n\n  return (\n    <div className=\"relative overflow-hidden\">\n      {/* Blur placeholder */}\n      {placeholder === 'blur' && !isLoaded && blurDataURL && (\n        <img\n          src={blurDataURL}\n          alt=\"\"\n          className={clsx(\n            'absolute inset-0 w-full h-full object-cover filter blur-sm scale-110',\n            className\n          )}\n          aria-hidden=\"true\"\n        />\n      )}\n\n      {/* Loading placeholder */}\n      {!isLoaded && placeholder === 'empty' && (\n        <div className=\"absolute inset-0\">\n          <PlaceholderDiv />\n        </div>\n      )}\n\n      {/* Optimized image with multiple formats */}\n      <picture>\n        {/* AVIF format for modern browsers */}\n        {generateAVIFSrcSet(src) && (\n          <source\n            srcSet={generateAVIFSrcSet(src)}\n            type=\"image/avif\"\n            sizes={sizes}\n          />\n        )}\n        \n        {/* WebP format for wide browser support */}\n        {generateWebPSrcSet(src) && (\n          <source\n            srcSet={generateWebPSrcSet(src)}\n            type=\"image/webp\"\n            sizes={sizes}\n          />\n        )}\n        \n        {/* Fallback to original format */}\n        <img\n          ref={imgRef}\n          src={imageSrc}\n          srcSet={generateStandardSrcSet(src)}\n          alt={alt}\n          className={clsx(\n            'transition-opacity duration-300',\n            {\n              'opacity-0': !isLoaded,\n              'opacity-100': isLoaded,\n              'object-cover': objectFit === 'cover',\n              'object-contain': objectFit === 'contain',\n              'object-fill': objectFit === 'fill',\n              'object-none': objectFit === 'none',\n              'object-scale-down': objectFit === 'scale-down'\n            },\n            className\n          )}\n          width={width}\n          height={height}\n          sizes={sizes}\n          loading={priority ? 'eager' : loading}\n          decoding={decoding}\n          crossOrigin={crossOrigin}\n          referrerPolicy={referrerPolicy}\n          role={role}\n          aria-describedby={ariaDescribedBy}\n          aria-labelledby={ariaLabelledBy}\n          onLoad={handleLoad}\n          onError={handleError}\n          {...props}\n        />\n      </picture>\n\n      {/* Loading indicator */}\n      {!isLoaded && (\n        <div className=\"absolute inset-0 flex items-center justify-center bg-neutral-light/50\">\n          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue\" />\n        </div>\n      )}\n    </div>\n  );\n}\n\n// Hook for lazy loading with accessibility considerations\nexport const useLazyLoad = (threshold = 0.1) => {\n  const [isIntersecting, setIsIntersecting] = useState(false);\n  const [hasBeenInView, setHasBeenInView] = useState(false);\n  const ref = useRef<HTMLElement>(null);\n\n  useEffect(() => {\n    const currentRef = ref.current;\n    if (!currentRef) return;\n\n    // Respect user's motion preferences\n    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n    const rootMargin = prefersReducedMotion ? '50px' : '100px';\n\n    const observer = new IntersectionObserver(\n      ([entry]) => {\n        if (entry.isIntersecting) {\n          setIsIntersecting(true);\n          setHasBeenInView(true);\n          \n          // Announce to screen readers when content loads\n          if (!hasBeenInView) {\n            const announcement = document.createElement('div');\n            announcement.setAttribute('aria-live', 'polite');\n            announcement.setAttribute('aria-atomic', 'true');\n            announcement.className = 'sr-only';\n            announcement.textContent = 'New content has loaded';\n            document.body.appendChild(announcement);\n            \n            setTimeout(() => {\n              document.body.removeChild(announcement);\n            }, 1000);\n          }\n        } else {\n          setIsIntersecting(false);\n        }\n      },\n      { \n        threshold, \n        rootMargin \n      }\n    );\n\n    observer.observe(currentRef);\n\n    return () => {\n      if (currentRef) {\n        observer.unobserve(currentRef);\n      }\n    };\n  }, [threshold, hasBeenInView]);\n\n  return [ref, isIntersecting, hasBeenInView] as const;\n};\n\n// Image optimization utilities\nexport const imageUtils = {\n  // Generate blur data URL for placeholder\n  generateBlurDataURL: (width = 10, height = 10) => {\n    const canvas = document.createElement('canvas');\n    canvas.width = width;\n    canvas.height = height;\n    const ctx = canvas.getContext('2d');\n    \n    if (!ctx) return '';\n    \n    // Create a simple gradient blur effect\n    const gradient = ctx.createLinearGradient(0, 0, width, height);\n    gradient.addColorStop(0, '#f3f4f6');\n    gradient.addColorStop(1, '#e5e7eb');\n    \n    ctx.fillStyle = gradient;\n    ctx.fillRect(0, 0, width, height);\n    \n    return canvas.toDataURL();\n  },\n\n  // Preload critical images\n  preloadImage: (src: string, priority = false) => {\n    if (typeof window === 'undefined') return;\n    \n    const link = document.createElement('link');\n    link.rel = priority ? 'preload' : 'prefetch';\n    link.as = 'image';\n    link.href = src;\n    \n    if (priority) {\n      link.setAttribute('fetchpriority', 'high');\n    }\n    \n    document.head.appendChild(link);\n  },\n\n  // Get optimal image dimensions based on container\n  getOptimalDimensions: (containerWidth: number, aspectRatio = 16/9) => {\n    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;\n    const targetWidth = Math.ceil(containerWidth * devicePixelRatio);\n    const targetHeight = Math.ceil(targetWidth / aspectRatio);\n    \n    return {\n      width: targetWidth,\n      height: targetHeight\n    };\n  }\n};"