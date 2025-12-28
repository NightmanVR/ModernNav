import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

const CACHE_KEY = "modern-nav-icon-cache-v1";

// Initialize global cache from localStorage
let loadedImagesCache: Set<string>;
try {
  const cached = localStorage.getItem(CACHE_KEY);
  loadedImagesCache = new Set(cached ? JSON.parse(cached) : []);
} catch (e) {
  loadedImagesCache = new Set();
}

// Helper to persist cache
const addToCache = (url: string) => {
  if (loadedImagesCache.has(url)) return;
  loadedImagesCache.add(url);
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(loadedImagesCache)));
  } catch (e) {
    console.warn("Failed to save icon cache to localStorage:", e);
  }
};

interface SmartIconProps {
  icon: string | undefined;
  className?: string; // Container class
  imgClassName?: string; // Specific image class
  size?: number;
}

export const SmartIcon: React.FC<SmartIconProps> = ({
  icon,
  className = "",
  imgClassName = "",
  size = 20,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Default fallback icon
  const DefaultIcon = Icons.Link;

  useEffect(() => {
    if (!icon) return;
    if (icon.startsWith("http") || icon.startsWith("data:")) {
      // Check cache immediately
      if (loadedImagesCache.has(icon)) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    }
  }, [icon]);

  if (!icon) {
    return <DefaultIcon size={size} className={className} />;
  }

  // Case 1: URL Image
  if (icon.startsWith("http") || icon.startsWith("data:")) {
    if (hasError) {
      return <DefaultIcon size={size} className={className} />;
    }

    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          src={icon}
          alt="icon"
          className={`transition-opacity duration-300 ease-in-out ${imgClassName} ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => {
            addToCache(icon);
            setIsLoaded(true);
          }}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Case 2: Lucide Icon
  // @ts-ignore
  const IconComponent = Icons[icon] as React.FC<LucideProps>;
  if (IconComponent) {
    return <IconComponent size={size} className={className} strokeWidth={1.5} />;
  }

  // Case 3: Emoji or Text
  return (
    <span
      className={`text-xl leading-none filter drop-shadow-md select-none ${className}`}
      style={{ fontSize: size }}
    >
      {icon}
    </span>
  );
};
