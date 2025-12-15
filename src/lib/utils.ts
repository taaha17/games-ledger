// pure utility functions - can be used on server or client
// no "use client" directive here so these work in server actions

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// tailwind css utility
// ============================================

// this merges tailwind classes and handles conflicts automatically
// super useful when you have conditional classes that might override each other
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// igdb image url helpers
// ============================================

// igdb gives us tiny thumbnails by default, so we need to swap the size in the url
// these are all the sizes igdb supports
export type IGDBImageSize = 
  | 'thumb'           // 90x90 - tiny, useless really
  | 'cover_small'     // 90x128 - still pretty small
  | 'cover_big'       // 264x374 - this is what we use for game cards
  | 'screenshot_med'  // 569x320 - decent size for screenshots
  | 'screenshot_big'  // 889x500 - bigger screenshots
  | 'screenshot_huge' // 1280x720 - full hd screenshots
  | 'logo_med'        // 284x160 - company logos
  | '720p'            // 1280x720 - good for backgrounds
  | '1080p';          // 1920x1080 - full hd, careful with bandwidth

// transforms an igdb image url to a different size
// igdb urls look like: //images.igdb.com/igdb/image/upload/t_thumb/abc123.jpg
// we just swap out the t_thumb part with whatever size we want
export function getIGDBImageUrl(
  url: string | undefined | null, 
  size: IGDBImageSize = 'cover_big'
): string | null {
  if (!url) return null;
  
  // igdb sometimes gives us urls without https, so we add it
  const fullUrl = url.startsWith('//') ? `https:${url}` : url;
  
  // swap the size in the url
  return fullUrl.replace(/t_\w+/, `t_${size}`);
}

// shorthand for getting a nice cover image
export function getCoverUrl(url: string | undefined | null): string | null {
  return getIGDBImageUrl(url, 'cover_big');
}

// shorthand for getting screenshots at different sizes
export function getScreenshotUrl(url: string | undefined | null, size: 'med' | 'big' | 'huge' = 'med'): string | null {
  const sizeMap = {
    med: 'screenshot_med',
    big: 'screenshot_big',
    huge: 'screenshot_huge',
  } as const;
  return getIGDBImageUrl(url, sizeMap[size]);
}

// ============================================
// date helpers
// ============================================

// igdb stores release dates as unix timestamps (seconds since 1970)
// this extracts just the year for display
export function formatReleaseYear(timestamp: number | undefined): string | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).getFullYear().toString();
}

// formats any date to a nice readable string like "Jan 15, 2024"
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// rating helpers
// ============================================

// we store ratings as 0-100 in the database (more precision)
// but display them as 0-5 stars in the ui
export function ratingToStars(rating: number | null | undefined): number {
  if (!rating) return 0;
  return rating / 20;
}

// opposite of above - converts star rating back to database format
export function starsToRating(stars: number): number {
  return stars * 20;
}

// ============================================
// string helpers
// ============================================

// genres and platforms are stored as comma-separated strings in our db
// this splits them back into an array for display
export function parseCommaList(str: string | null | undefined): string[] {
  if (!str) return [];
  return str.split(', ').filter(Boolean);
}

// igdb gives us arrays of objects like [{name: "Action"}, {name: "RPG"}]
// this flattens them to "Action, RPG" for storing in our db
export function toCommaList(items: Array<{ name: string }> | undefined): string {
  if (!items || items.length === 0) return '';
  return items.map(item => item.name).join(', ');
}

// truncates text and adds ... at the end if it's too long
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ============================================
// file validation
// ============================================

// checks if a file is under the max size limit
// maxSizeBytes should be in bytes (e.g., 5 * 1024 * 1024 for 5MB)
export function isValidFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

// checks if a file is an acceptable image type
// we allow jpeg, png, gif, and webp
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// ============================================
// url helpers
// ============================================

// builds a relative profile url for internal links
export function getProfileUrl(userId: string): string {
  return `/u/${userId}`;
}

// builds an absolute profile url for sharing (includes the domain)
export function getAbsoluteProfileUrl(userId: string, origin: string): string {
  return `${origin}/u/${userId}`;
}

// ============================================
// re-export hooks from hooks.ts for backward compatibility
// ============================================
// note: these hooks are in a separate file with "use client" directive
// import them from '@/lib/hooks' if you need them directly
export { 
  useDebounce, 
  useDebouncedCallback, 
  useClickOutside, 
  useKeyboardShortcut,
  useLocalStorage,
  useMediaQuery,
  useAsync 
} from './hooks';
