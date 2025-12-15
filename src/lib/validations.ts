// ============================================
// input validation
// ============================================
// using zod for runtime validation of user input
// this prevents bad data from reaching our database

import { z } from "zod";
import type { GameStatus } from "@/types";

// ============================================
// profile validation
// ============================================
// validates user profile updates
// keeps bio length reasonable and validates social handles

export const profileSchema = z.object({
  // bio has a character limit so profiles don't get too crazy
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  
  // images are stored as base64 strings for now (yeah i know, we'll fix this later)
  headerUrl: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  
  // gamertags - these are just strings, no special validation needed
  steamId: z.string().max(50, "Steam ID too long").optional().or(z.literal("")),
  psnId: z.string().max(50, "PSN ID too long").optional().or(z.literal("")),
  xboxGamertag: z.string().max(50, "Xbox Gamertag too long").optional().or(z.literal("")),
  
  // nintendo friend codes have a specific format: SW-XXXX-XXXX-XXXX
  nintendoFriendCode: z.string()
    .regex(/^(SW-\d{4}-\d{4}-\d{4})?$/, "Invalid Nintendo Friend Code format (SW-XXXX-XXXX-XXXX)")
    .optional()
    .or(z.literal("")),
  
  eaId: z.string().max(50, "EA ID too long").optional().or(z.literal("")),
  ubisoftId: z.string().max(50, "Ubisoft ID too long").optional().or(z.literal("")),
  gogId: z.string().max(50, "GOG ID too long").optional().or(z.literal("")),
  
  // socials - we store just the username, not full urls
  twitter: z.string()
    .max(15, "Twitter handle too long")
    .regex(/^[a-zA-Z0-9_]*$/, "Invalid Twitter handle")
    .optional()
    .or(z.literal("")),
  instagram: z.string()
    .max(30, "Instagram handle too long")
    .regex(/^[a-zA-Z0-9._]*$/, "Invalid Instagram handle")
    .optional()
    .or(z.literal("")),
  discord: z.string()
    .max(32, "Discord username too long")
    .optional()
    .or(z.literal("")),
  twitch: z.string()
    .max(25, "Twitch username too long")
    .regex(/^[a-zA-Z0-9_]*$/, "Invalid Twitch username")
    .optional()
    .or(z.literal("")),
  youtube: z.string()
    .max(50, "YouTube channel too long")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================
// game library validation
// ============================================
// validates when adding or updating games in library

// all valid game statuses (matches our prisma enum)
const gameStatusValues: [GameStatus, ...GameStatus[]] = ['PLANNING', 'PLAYING', 'COMPLETED', 'DROPPED'];

export const addToLibrarySchema = z.object({
  status: z.enum(gameStatusValues),
  // rating is 0-100 internally, displayed as 0-5 stars
  rating: z.number().min(0).max(100).optional().nullable(),
  // reviews can get long, but let's be reasonable
  review: z.string().max(5000, "Review must be 5000 characters or less").optional().or(z.literal("")),
});

export type AddToLibraryFormData = z.infer<typeof addToLibrarySchema>;

// ============================================
// search validation
// ============================================
// validates search queries before hitting igdb

export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query required").max(200, "Search query too long").trim(),
});

// ============================================
// game data schema
// ============================================
// validates game data from igdb or our library

export const igdbGameSchema = z.object({
  id: z.number(),
  igdbId: z.number().optional(), // only present on library games
  name: z.string(),
  coverUrl: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  // genres can be either a comma string (from db) or array of objects (from igdb)
  genres: z.union([
    z.string(),
    z.array(z.object({ name: z.string() })),
  ]).optional(),
  platforms: z.union([
    z.string(),
    z.array(z.object({ name: z.string() })),
  ]).optional(),
  status: z.enum(gameStatusValues).optional(),
  rating: z.number().nullable().optional(),
  review: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  userId: z.string().optional(),
});

export type IGDBGameInput = z.infer<typeof igdbGameSchema>;

// ============================================
// validation helpers
// ============================================
// helper functions that return nice error messages

// validates profile data and returns either success with data or an error message
export function validateProfileData(data: unknown): { success: true; data: ProfileFormData } | { success: false; error: string } {
  const result = profileSchema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { 
      success: false, 
      error: firstError?.message || "Invalid profile data" 
    };
  }
  
  return { success: true, data: result.data };
}

// validates game library form data
export function validateAddToLibrary(data: unknown): { success: true; data: AddToLibraryFormData } | { success: false; error: string } {
  const result = addToLibrarySchema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { 
      success: false, 
      error: firstError?.message || "Invalid game data" 
    };
  }
  
  return { success: true, data: result.data };
}

// validates search queries
export function validateSearchQuery(query: unknown): { success: true; query: string } | { success: false; error: string } {
  const result = searchQuerySchema.safeParse({ query });
  
  if (!result.success) {
    return { success: false, error: "Invalid search query" };
  }
  
  return { success: true, query: result.data.query };
}
