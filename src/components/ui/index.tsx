"use client";

// ============================================
// ui components
// ============================================
// this file contains reusable ui components that are used across the app
// things like skeletons for loading states, toaster for notifications, etc

import { cn } from "@/lib/utils";
import { Toaster as Sonner } from "sonner";

// ============================================
// toaster
// ============================================
// wraps sonner toaster with our custom styling
// just add <Toaster /> to your layout and use toast() anywhere in your app

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

// ============================================
// skeleton components
// ============================================
// these are placeholder loading states that show while content is loading
// they pulse/animate to let the user know something is happening

interface SkeletonProps {
  className?: string;
}

// basic skeleton box - the building block for all other skeletons
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800",
        className
      )}
    />
  );
}

// skeleton for game cards in the grid
// has the aspect ratio of a game cover with a title area below
export function GameCardSkeleton({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "h-32",
    medium: "h-48",
    large: "h-64",
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900/50 overflow-hidden">
      <div className={cn("relative aspect-[3/4] w-full", sizeClasses[size])}>
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// grid of skeleton game cards - use for loading states on game lists
export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}

// full profile page header skeleton
// shows avatar, name, bio area, and stats while profile loads
export function ProfileHeaderSkeleton() {
  return (
    <div className="min-h-screen bg-[#161616]">
      {/* banner area */}
      <div className="relative h-64 md:h-80 w-full">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
          {/* avatar */}
          <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full" />

          {/* user info */}
          <div className="flex-1 mb-4 space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* stats */}
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// skeleton for the search page with search bar and results grid
export function SearchResultsSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-2 mb-8 max-w-2xl mx-auto">
        <Skeleton className="flex-1 h-12" />
        <Skeleton className="w-24 h-12" />
      </div>
      <GameGridSkeleton count={12} />
    </div>
  );
}

// skeleton for the game details modal
// shows the layout without actual content
export function GameDetailsSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      {/* header image */}
      <Skeleton className="h-64 sm:h-80 w-full rounded-none" />
      
      {/* content area */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex gap-4">
          <Skeleton className="w-28 h-40 shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// skeleton for review cards
export function ReviewCardSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="w-16 h-24 shrink-0 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// generic list skeleton for any list of items
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
