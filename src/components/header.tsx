import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import Link from "next/link";
import UserMenu from "./user-menu";

export default async function Header() {
  const { userId } = await auth();
  let dbUser = null;
  
  if (userId) {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, username: true, id: true }
    });
  }

  return (
    <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="text-3xl font-bold tracking-tight">
        GamesLedger
      </Link>
      <nav className="flex items-center gap-6">
        <SignedIn>
          <Link href="/profile" className="text-lg font-medium hover:text-blue-600 transition-colors">
            My Library
          </Link>
          <UserMenu dbUser={dbUser} />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 text-lg rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </nav>
    </header>
  );
}
