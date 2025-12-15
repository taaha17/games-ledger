import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfileView from "@/components/profile-view";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import type { SerializedClerkUser, DBUser, LibraryGame } from "@/types";

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}): Promise<Metadata> {
  const { userId } = await params;
  
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, bio: true },
    });
    
    const gamesCount = await prisma.game.count({
      where: { userId },
    });
    
    const completedCount = await prisma.game.count({
      where: { userId, status: "COMPLETED" },
    });
    
    const displayName = user.fullName || user.username || "User";
    const description = dbUser?.bio 
      ? `${dbUser.bio.slice(0, 150)}${dbUser.bio.length > 150 ? '...' : ''}`
      : `${displayName} has tracked ${gamesCount} games (${completedCount} completed) on GamesLedger.`;
    
    return {
      title: `${displayName}'s Profile | GamesLedger`,
      description,
      openGraph: {
        title: `${displayName}'s Game Library | GamesLedger`,
        description,
        images: dbUser?.avatarUrl ? [dbUser.avatarUrl] : [user.imageUrl],
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${displayName}'s Profile | GamesLedger`,
        description,
        images: dbUser?.avatarUrl ? [dbUser.avatarUrl] : [user.imageUrl],
      },
    };
  } catch {
    return {
      title: "Profile | GamesLedger",
      description: "View this user's game library on GamesLedger.",
    };
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { userId: currentUserId } = await auth();

  // Fetch user from Clerk
  let user;
  try {
    const client = await clerkClient();
    user = await client.users.getUser(userId);
  } catch (e) {
    return notFound();
  }

  // Serialize the Clerk user object to a plain object
  const serializedUser: SerializedClerkUser = {
    id: user.id,
    imageUrl: user.imageUrl,
    fullName: user.fullName,
    username: user.username,
  };

  // Fetch games from Prisma
  const games = await prisma.game.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  }) as LibraryGame[];

  // Fetch bio and other details from Prisma User model
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  }) as DBUser | null;

  const isOwner = currentUserId === userId;

  return (
    <ProfileView 
      user={serializedUser} 
      dbUser={dbUser} 
      games={games} 
      isOwner={isOwner} 
    />
  );
}
