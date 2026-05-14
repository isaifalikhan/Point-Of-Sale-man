'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  fallback,
  priority = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isExternal = src?.startsWith('http') && !src.includes('localhost');
  const isDataUrl = src?.startsWith('data:');

  if (hasError || !src) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <>
      {isLoading && (
        <div className={cn("absolute inset-0 bg-slate-100 animate-pulse", className)} />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        unoptimized={isExternal || isDataUrl}
        className={cn(
          className,
          isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
});
