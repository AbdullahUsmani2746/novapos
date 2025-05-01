import React from 'react';
import { Loader2, LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({ 
  variant = "pulse", // default, simple, pulse, dots
  size = "large", // small, default, large
  fullscreen = true,
  text = "Loading..."
}) => {
  // Size mappings
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };

  // Container classes based on fullscreen prop
  const containerClasses = fullscreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    : "flex justify-center items-center h-[65vh]";

  const renderVariant = () => {
    switch (variant) {
      case "simple":
        return (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
            {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
          </div>
        );

      case "pulse":
        return (
          <div className="flex flex-col items-center gap-3">
            <div className={`${sizeClasses[size]} relative`}>
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
              <LoaderCircle className={`${sizeClasses[size]} animate-spin text-primary`} />
            </div>
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        );

      case "dots":
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-primary rounded-full animate-bounce`}
                  style={{
                    width: size === "small" ? 6 : size === "large" ? 12 : 8,
                    height: size === "small" ? 6 : size === "large" ? 12 : 8,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className={`${sizeClasses[size]} border-4 border-primary/30 rounded-full`} />
              <div 
                className={`${sizeClasses[size]} border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0`}
              />
            </div>
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        );
    }
  };

  return (
    <div className={`${containerClasses} flex items-center justify-center`}>
      {renderVariant()}
    </div>
  );
};

export default LoadingSpinner;