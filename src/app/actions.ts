"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { searchGames, getPopularGames, getGameDetails } from "@/lib/igdb";

/**
 * This is a "Server Action". It runs on the server, not the user's browser.
 * This is important because it keeps our API keys hidden from the user.
 */
export async function searchGamesAction(query: string) {
  if (!query) return [];
  try {
    const games = await searchGames(query);
    
    // Process the results before sending them to the frontend
    // We replace "t_thumb" with "t_cover_big" to get higher quality images
    return games.map((game: any) => ({
      ...game,
      coverUrl: game.cover?.url 
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}` 
        : null
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export async function getPopularGamesAction(offset: number = 0) {
  try {
    const games = await getPopularGames(offset);
    return games.map((game: any) => ({
      ...game,
      coverUrl: game.cover?.url 
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}` 
        : null
    }));
  } catch (error) {
    console.error("Popular games error:", error);
    return [];
  }
}

export async function getGameDetailsAction(gameId: number) {
  try {
    const game = await getGameDetails(gameId);
    if (!game) return null;

    // Process images
    const processedGame = {
      ...game,
      coverUrl: game.cover?.url 
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}` 
        : null,
      screenshots: game.screenshots?.map((s: any) => ({
        ...s,
        url: s.url ? `https:${s.url.replace("t_thumb", "t_screenshot_med")}` : null
      })) || [],
      similar_games: game.similar_games?.map((s: any) => ({
        ...s,
        coverUrl: s.cover?.url ? `https:${s.cover.url.replace("t_thumb", "t_cover_big")}` : null
      })) || []
    };
    
    return processedGame;
  } catch (error) {
    console.error("Game details error:", error);
    return null;
  }
}

export async function removeFromLibrary(gameId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to remove games." };
  }

  try {
    await prisma.game.deleteMany({
      where: {
        id: gameId,
        userId: userId,
      },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Remove error:", error);
    return { error: "Failed to remove game." };
  }
}

export async function updateProfile(data: {
  bio?: string;
  headerUrl?: string;
  avatarUrl?: string;
  steamId?: string;
  psnId?: string;
  xboxGamertag?: string;
  nintendoFriendCode?: string;
  eaId?: string;
  ubisoftId?: string;
  gogId?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  twitch?: string;
  youtube?: string;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
      },
    });
    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }
}

export async function toggleFavorite(gameId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game || game.userId !== userId) {
      return { error: "Game not found" };
    }

    await prisma.game.update({
      where: { id: gameId },
      data: { isFavorite: !game.isFavorite },
    });

    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return { error: "Failed to toggle favorite" };
  }
}

export async function addToLibrary(game: any, formData?: { status: string; rating?: number; review?: string }) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to add games." };
  }

  try {
    // Get full user details from Clerk to get the email
    const user = await currentUser();
    if (!user) {
      return { error: "User not found." };
    }
    const email = user.emailAddresses[0]?.emailAddress;

    // Ensure the user exists in our database
    await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: {
        id: userId,
        email: email || "",
      },
    });

    // Determine the correct IGDB ID
    // If game comes from our DB (Prisma), it has 'igdbId' property
    // If game comes from IGDB API, it has 'id' property which is the IGDB ID
    const igdbId = game.igdbId || game.id;

    // Check if game already exists for this user
    const existingGame = await prisma.game.findUnique({
      where: {
        userId_igdbId: {
          userId,
          igdbId: igdbId,
        },
      },
    });

    if (existingGame) {
      // If it exists, update it instead of erroring
      await prisma.game.update({
        where: { id: existingGame.id },
        data: {
          status: formData?.status || existingGame.status,
          rating: formData?.rating ?? existingGame.rating,
          review: formData?.review ?? existingGame.review,
        },
      });
      revalidatePath("/");
      revalidatePath("/profile");
      return { success: true, updated: true };
    }

    // Add the game to the database
    await prisma.game.create({
      data: {
        igdbId: igdbId,
        name: game.name,
        coverUrl: game.coverUrl,
        summary: game.summary,
        genres: typeof game.genres === 'string' ? game.genres : game.genres?.map((g: any) => g.name).join(", "),
        platforms: typeof game.platforms === 'string' ? game.platforms : game.platforms?.map((p: any) => p.name).join(", "),
        userId,
        status: formData?.status || "PLANNING",
        rating: formData?.rating,
        review: formData?.review,
      },
    });

    // Refresh the page data so the UI updates
    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to add game:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
