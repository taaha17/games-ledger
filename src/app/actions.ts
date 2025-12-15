"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { searchGames, getPopularGames, getGameDetails } from "@/lib/igdb";
import { validateProfileData, validateAddToLibrary } from "@/lib/validations";
import { getCoverUrl, getScreenshotUrl, toCommaList } from "@/lib/utils";
import type { 
  ActionResult, 
  ProcessedIGDBGame, 
  IGDBGame, 
  UpdateProfileData,
  LibraryGame,
  GameStatus 
} from "@/types";

// ============================================
// Internal Helpers
// ============================================

type ActivityType = "ADD_GAME" | "COMPLETE_GAME" | "REVIEW" | "FOLLOW" | "FAVORITE";

/**
 * Log user activity (internal function)
 * placed at top since it's used by multiple actions
 */
async function logActivity(
  userId: string,
  type: ActivityType,
  metadata: Record<string, unknown>
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (error) {
    // don't throw - activity logging shouldn't break main actions
    console.error("Activity logging error:", error);
  }
}

// ============================================
// Game Search Actions
// ============================================

/**
 * Search for games using IGDB API
 * This is a "Server Action" - it runs on the server to keep API keys hidden
 */
export async function searchGamesAction(query: string): Promise<ProcessedIGDBGame[]> {
  if (!query || query.trim().length === 0) return [];
  
  try {
    const games = await searchGames(query.trim());
    
    return games.map((game: IGDBGame) => ({
      ...game,
      coverUrl: getCoverUrl(game.cover?.url),
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

/**
 * Get popular games from IGDB
 */
export async function getPopularGamesAction(offset: number = 0): Promise<ProcessedIGDBGame[]> {
  try {
    const games = await getPopularGames(offset);
    
    return games.map((game: IGDBGame) => ({
      ...game,
      coverUrl: getCoverUrl(game.cover?.url),
    }));
  } catch (error) {
    console.error("Popular games error:", error);
    return [];
  }
}

/**
 * Get detailed information about a specific game
 */
export async function getGameDetailsAction(gameId: number): Promise<ProcessedIGDBGame | null> {
  if (!gameId || typeof gameId !== 'number') return null;
  
  try {
    const game = await getGameDetails(gameId);
    if (!game) return null;

    const processedGame: ProcessedIGDBGame = {
      ...game,
      coverUrl: getCoverUrl(game.cover?.url),
      screenshots: game.screenshots?.map((s: { url: string }) => ({
        ...s,
        url: getScreenshotUrl(s.url, 'med'),
      })) || [],
      similar_games: game.similar_games?.map((s: IGDBGame) => ({
        ...s,
        coverUrl: getCoverUrl(s.cover?.url),
      })) || [],
    };
    
    return processedGame;
  } catch (error) {
    console.error("Game details error:", error);
    return null;
  }
}

/**
 * Remove a game from the user's library
 */
export async function removeFromLibrary(gameId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to remove games." };
  }

  if (!gameId || typeof gameId !== 'string') {
    return { error: "Invalid game ID." };
  }

  try {
    // Verify the game belongs to the user before deleting
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        userId: userId,
      },
    });

    if (!game) {
      return { error: "Game not found in your library." };
    }

    await prisma.game.delete({
      where: { id: gameId },
    });

    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Remove error:", error);
    return { error: "Failed to remove game." };
  }
}

/**
 * Update user profile with validation
 */
export async function updateProfile(data: UpdateProfileData): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Validate the input data
  const validation = validateProfileData(data);
  if (!validation.success) {
    return { error: validation.error };
  }

  try {
    // Clean empty strings to null for database
    const cleanedData = Object.fromEntries(
      Object.entries(validation.data).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    await prisma.user.update({
      where: { id: userId },
      data: cleanedData,
    });

    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }
}

/**
 * Toggle a game's favorite status
 */
export async function toggleFavorite(gameId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  if (!gameId || typeof gameId !== 'string') {
    return { error: "Invalid game ID." };
  }

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

/**
 * Add a game to the user's library or update existing entry
 */
export async function addToLibrary(
  game: ProcessedIGDBGame | LibraryGame, 
  formData?: { status: string; rating?: number; review?: string }
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to add games." };
  }

  // Validate form data if provided
  if (formData) {
    const validation = validateAddToLibrary(formData);
    if (!validation.success) {
      return { error: validation.error };
    }
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
    const igdbId = 'igdbId' in game ? game.igdbId : game.id;

    // Check if game already exists for this user
    const existingGame = await prisma.game.findUnique({
      where: {
        userId_igdbId: {
          userId,
          igdbId: igdbId,
        },
      },
    });

    const status = (formData?.status || "PLANNING") as GameStatus;

    if (existingGame) {
      // If it exists, update it instead of erroring
      // note: reviews are now in a separate model, not on the game itself
      await prisma.game.update({
        where: { id: existingGame.id },
        data: {
          status,
          rating: formData?.rating ?? existingGame.rating,
        },
      });
      revalidatePath("/");
      revalidatePath("/profile");
      revalidatePath(`/u/${userId}`);
      return { success: true, updated: true };
    }

    // Process genres and platforms
    const genres = 'genres' in game 
      ? (typeof game.genres === 'string' 
          ? game.genres 
          : toCommaList(game.genres as Array<{ name: string }> | undefined))
      : null;
    
    const platforms = 'platforms' in game
      ? (typeof game.platforms === 'string'
          ? game.platforms
          : toCommaList(game.platforms as Array<{ name: string }> | undefined))
      : null;

    // Add the game to the database
    // reviews are handled separately now via the Review model
    const newGame = await prisma.game.create({
      data: {
        igdbId: igdbId,
        name: game.name,
        coverUrl: 'coverUrl' in game ? game.coverUrl : null,
        summary: 'summary' in game ? game.summary : null,
        genres,
        platforms,
        userId,
        status,
        rating: formData?.rating,
      },
    });

    // log activity for adding a game
    await logActivity(userId, "ADD_GAME", {
      gameId: newGame.id,
      gameName: game.name,
      coverUrl: 'coverUrl' in game ? game.coverUrl : null,
      status,
    });

    // Refresh the page data so the UI updates
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add game:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// ============================================
// Review Actions
// ============================================

/**
 * Create or update a review for a game
 */
export async function createOrUpdateReview(
  gameId: string,
  data: { rating: number; content?: string; hasSpoilers?: boolean }
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to write reviews." };
  }

  // validate rating is between 0 and 100 (internal format)
  if (data.rating < 0 || data.rating > 100) {
    return { error: "Rating must be between 0 and 5 stars." };
  }

  try {
    // verify the game exists and belongs to the user
    const game = await prisma.game.findFirst({
      where: { id: gameId, userId },
    });

    if (!game) {
      return { error: "Game not found in your library." };
    }

    // check for existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (existingReview) {
      // update existing review
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          content: data.content || "",
          hasSpoilers: data.hasSpoilers || false,
        },
      });
    } else {
      // create new review
      await prisma.review.create({
        data: {
          userId,
          gameId,
          rating: data.rating,
          content: data.content || "",
          hasSpoilers: data.hasSpoilers || false,
        },
      });

      // log activity for review
      await logActivity(userId, "REVIEW", {
        gameId,
        gameName: game.name,
        coverUrl: game.coverUrl,
        rating: data.rating,
      });
    }

    // also update the game's rating field for quick access
    await prisma.game.update({
      where: { id: gameId },
      data: { rating: data.rating },
    });

    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Create/update review error:", error);
    return { error: "Failed to save review." };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      return { error: "Review not found." };
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // clear the rating from the game
    await prisma.game.update({
      where: { id: review.gameId },
      data: { rating: null },
    });

    revalidatePath("/profile");
    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { error: "Failed to delete review." };
  }
}

/**
 * Vote on a review (upvote or downvote)
 */
export async function voteOnReview(
  reviewId: string,
  isUpvote: boolean
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to vote." };
  }

  try {
    // check for existing vote
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        userId_reviewId: { userId, reviewId },
      },
    });

    if (existingVote) {
      if (existingVote.isUpvote === isUpvote) {
        // clicking same vote removes it
        await prisma.reviewVote.delete({
          where: { id: existingVote.id },
        });
        
        // update cached vote counts on review
        await prisma.review.update({
          where: { id: reviewId },
          data: isUpvote 
            ? { upvotes: { decrement: 1 } }
            : { downvotes: { decrement: 1 } },
        });
      } else {
        // switch vote type
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { isUpvote },
        });
        
        // update cached vote counts
        await prisma.review.update({
          where: { id: reviewId },
          data: isUpvote
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        });
      }
    } else {
      // create new vote
      await prisma.reviewVote.create({
        data: {
          userId,
          reviewId,
          isUpvote,
        },
      });
      
      // update cached vote counts
      await prisma.review.update({
        where: { id: reviewId },
        data: isUpvote 
          ? { upvotes: { increment: 1 } }
          : { downvotes: { increment: 1 } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Vote error:", error);
    return { error: "Failed to vote." };
  }
}

/**
 * Reply to a review
 */
export async function replyToReview(
  reviewId: string,
  content: string
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to reply." };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Reply cannot be empty." };
  }

  if (content.length > 500) {
    return { error: "Reply is too long (max 500 characters)." };
  }

  try {
    await prisma.reviewReply.create({
      data: {
        userId,
        reviewId,
        content: content.trim(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Reply error:", error);
    return { error: "Failed to post reply." };
  }
}

/**
 * Delete a reply
 */
export async function deleteReply(replyId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const reply = await prisma.reviewReply.findUnique({
      where: { id: replyId },
    });

    if (!reply || reply.userId !== userId) {
      return { error: "Reply not found." };
    }

    await prisma.reviewReply.delete({
      where: { id: replyId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete reply error:", error);
    return { error: "Failed to delete reply." };
  }
}

/**
 * Get reviews for a game with pagination
 */
export async function getGameReviews(
  igdbId: number,
  page: number = 1,
  limit: number = 10
) {
  try {
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: {
        game: { igdbId },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.review.count({
      where: {
        game: { igdbId },
      },
    });

    return {
      reviews,
      total,
      hasMore: skip + reviews.length < total,
    };
  } catch (error) {
    console.error("Get reviews error:", error);
    return { reviews: [], total: 0, hasMore: false };
  }
}

// ============================================
// Follow System Actions
// ============================================

/**
 * Follow or unfollow a user
 */
export async function toggleFollow(targetUserId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You must be logged in to follow users." };
  }

  if (userId === targetUserId) {
    return { error: "You cannot follow yourself." };
  }

  try {
    // check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return { success: true, following: false };
    } else {
      // follow
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId,
        },
      });

      // log activity
      await logActivity(userId, "FOLLOW", { targetUserId });

      return { success: true, following: true };
    }
  } catch (error) {
    console.error("Toggle follow error:", error);
    return { error: "Failed to update follow status." };
  }
}

/**
 * Get follow status and counts for a user
 */
export async function getFollowStats(targetUserId: string) {
  const { userId } = await auth();

  try {
    const [followers, following, isFollowing] = await Promise.all([
      prisma.follow.count({
        where: { followingId: targetUserId },
      }),
      prisma.follow.count({
        where: { followerId: targetUserId },
      }),
      userId
        ? prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: userId,
                followingId: targetUserId,
              },
            },
          })
        : null,
    ]);

    return {
      followers,
      following,
      isFollowing: !!isFollowing,
    };
  } catch (error) {
    console.error("Get follow stats error:", error);
    return { followers: 0, following: 0, isFollowing: false };
  }
}

/**
 * Get followers list for a user
 */
export async function getFollowers(
  targetUserId: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const skip = (page - 1) * limit;

    const followers = await prisma.follow.findMany({
      where: { followingId: targetUserId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    return {
      followers: followers.map((f) => f.follower),
      total,
      hasMore: skip + followers.length < total,
    };
  } catch (error) {
    console.error("Get followers error:", error);
    return { followers: [], total: 0, hasMore: false };
  }
}

/**
 * Get following list for a user
 */
export async function getFollowing(
  targetUserId: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: targetUserId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.follow.count({
      where: { followerId: targetUserId },
    });

    return {
      following: following.map((f) => f.following),
      total,
      hasMore: skip + following.length < total,
    };
  } catch (error) {
    console.error("Get following error:", error);
    return { following: [], total: 0, hasMore: false };
  }
}

// ============================================
// Activity Feed Actions
// ============================================

/**
 * Get activity feed for a user
 */
export async function getUserActivity(
  targetUserId: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const skip = (page - 1) * limit;

    const activities = await prisma.activity.findMany({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.activity.count({
      where: { userId: targetUserId },
    });

    return {
      activities: activities.map((a) => ({
        ...a,
        metadata: a.metadata ? JSON.parse(a.metadata) : {},
      })),
      total,
      hasMore: skip + activities.length < total,
    };
  } catch (error) {
    console.error("Get user activity error:", error);
    return { activities: [], total: 0, hasMore: false };
  }
}

/**
 * Get activity feed from followed users
 */
export async function getFollowingActivity(page: number = 1, limit: number = 20) {
  const { userId } = await auth();
  if (!userId) {
    return { activities: [], total: 0, hasMore: false };
  }

  try {
    const skip = (page - 1) * limit;

    // get list of followed users
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    const activities = await prisma.activity.findMany({
      where: {
        userId: { in: followingIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.activity.count({
      where: {
        userId: { in: followingIds },
      },
    });

    return {
      activities: activities.map((a) => ({
        ...a,
        metadata: a.metadata ? JSON.parse(a.metadata) : {},
      })),
      total,
      hasMore: skip + activities.length < total,
    };
  } catch (error) {
    console.error("Get following activity error:", error);
    return { activities: [], total: 0, hasMore: false };
  }
}
