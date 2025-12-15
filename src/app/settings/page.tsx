import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import SettingsForm from "./settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings | GamesLedger",
  description: "Manage your GamesLedger account settings",
};

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#161616] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Account Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your account is managed through Clerk authentication
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User ID
                </label>
                <p className="mt-1 text-gray-900 dark:text-white font-mono text-sm">
                  {userId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {dbUser?.email || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Member Since
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {dbUser?.createdAt 
                    ? new Date(dbUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Username Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Username</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set a custom username for your public profile URL
              </p>
            </div>
            <div className="p-6">
              <SettingsForm 
                currentUsername={dbUser?.username || null}
                userId={userId}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden">
            <div className="p-6 border-b border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
              <p className="text-sm text-red-500/70 dark:text-red-400/70 mt-1">
                Irreversible actions that affect your account
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
