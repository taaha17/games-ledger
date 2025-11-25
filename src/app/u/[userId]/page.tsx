import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfileView from "@/components/profile-view";
import { auth } from "@clerk/nextjs/server";

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
  const serializedUser = {
    id: user.id,
    imageUrl: user.imageUrl,
    fullName: user.fullName,
    username: user.username,
  };

  // Fetch games from Prisma
  const games = await prisma.game.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch bio and other details from Prisma User model
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isOwner = currentUserId === userId;

  return (
    <ProfileView 
      user={serializedUser} 
      dbUser={dbUser || {}} 
      games={games} 
      isOwner={isOwner} 
    />
  );
}
