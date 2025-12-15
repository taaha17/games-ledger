"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0-100 (internal storage)
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

// converts internal rating (0-100) to display rating (0-5 with 0.5 increments)
const toDisplayRating = (internal: number) => internal / 20;
// converts display rating (0-5) to internal rating (0-100)
const toInternalRating = (display: number) => display * 20;

export default function StarRating({ 
  rating, 
  onChange, 
  readonly = false,
  size = "md",
  showValue = true 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const displayRating = hoverRating !== null ? hoverRating : toDisplayRating(rating);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (readonly || !onChange) return;
    
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(toInternalRating(newRating));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    
    setHoverRating(isHalf ? starIndex + 0.5 : starIndex + 1);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(null);
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn("flex items-center", !readonly && "cursor-pointer")}
        onMouseLeave={handleMouseLeave}
      >
        {[0, 1, 2, 3, 4].map((starIndex) => {
          // calculate fill percentage for this star
          const fillPercentage = Math.min(Math.max((displayRating - starIndex) * 100, 0), 100);
          
          return (
            <div
              key={starIndex}
              className="relative"
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const isHalf = x < rect.width / 2;
                handleClick(starIndex, isHalf);
              }}
            >
              {/* background star (empty) */}
              <Star 
                className={cn(
                  sizeClasses[size],
                  "text-zinc-600 transition-colors"
                )} 
              />
              {/* foreground star (filled) - uses clip-path for partial fill */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star 
                  className={cn(
                    sizeClasses[size],
                    "text-yellow-500 fill-yellow-500 transition-colors"
                  )} 
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {showValue && (
        <span className={cn(textSizes[size], "text-zinc-400 font-medium tabular-nums")}>
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
