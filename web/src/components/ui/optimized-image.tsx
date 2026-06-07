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

/** Remote / data URLs use a plain img tag — more reliable in POS cards than next/image fill. */
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src?.trim()) {
    return fallback ? <>{fallback}</> : null;
  }

  const isDataUrl = src.startsWith('data:');
  const isRemote = /^https?:\/\//i.test(src);

  if (isRemote || isDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn(
          fill ? 'absolute inset-0 h-full w-full object-cover' : '',
          className,
        )}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className={cn('absolute inset-0 bg-slate-100 animate-pulse', className)} />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={cn(
          className,
          isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300',
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
