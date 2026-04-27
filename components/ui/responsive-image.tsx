"use client";

import { useState } from "react";
import NextImage from "next/image";

interface ResponsiveImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * Responsive Image Component with WebP optimization
 * Automatically loads the appropriate size based on viewport
 * Falls back to PNG for browsers that don't support WebP
 */
export function ResponsiveImage({
  src,
  alt,
  className = "",
  priority = false,
  onLoad,
  onClick,
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src) {
    return (
      <div className={`bg-surface-secondary rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-text-muted text-sm">Image not available</p>
      </div>
    );
  }

  // Convert PNG to WebP URLs
  const isPng = src.endsWith(".png");
  const webpSrc = isPng ? src.replace(/\.png$/i, ".webp") : src;
  const baseSrc = isPng ? src.replace(/\.png$/i, "") : src.replace(/\.(webp|jpg|jpeg)$/i, "");

  // Generate responsive URLs
  const thumbnailUrl = `${baseSrc}-thumb.webp`;
  const mediumUrl = `${baseSrc}-medium.webp`;
  const largeUrl = `${baseSrc}-large.webp`;

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface-secondary rounded-lg animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <picture>
        {/* WebP sources with responsive sizes */}
        {!imageError && (
          <>
            {/* Large screens: 1200px+ */}
            <source
              type="image/webp"
              media="(min-width: 1200px)"
              srcSet={largeUrl}
            />
            {/* Medium screens: 800-1199px */}
            <source
              type="image/webp"
              media="(min-width: 800px)"
              srcSet={mediumUrl}
            />
            {/* Small screens: <800px */}
            <source
              type="image/webp"
              media="(max-width: 799px)"
              srcSet={thumbnailUrl}
            />
            {/* Default WebP */}
            <source type="image/webp" srcSet={webpSrc} />
          </>
        )}
        
        {/* PNG fallback for old browsers or if WebP fails */}
        <NextImage
          src={imageError ? src : webpSrc}
          alt={alt}
          width={1200}
          height={675}
          className={`w-full h-auto rounded-lg ${onClick ? "cursor-zoom-in" : ""} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          onClick={onClick}
          unoptimized // We're already optimizing with WebP
        />
      </picture>
    </div>
  );
}
