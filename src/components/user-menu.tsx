"use client";

import { useState, useRef, useEffect } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, User, ChevronDown } from "lucide-react";

interface UserMenuProps {
  dbUser?: {
    avatarUrl?: string | null;
    username?: string | null;
    id?: string;
  } | null;
}

export default function UserMenu({ dbUser }: UserMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const avatarUrl = dbUser?.avatarUrl || user.imageUrl;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <Image
            src={avatarUrl}
            alt={user.fullName || "User"}
            fill
            className="object-cover"
          />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
          <p className="text-xs text-zinc-500 mt-1 truncate max-w-[100px]">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <p className="font-medium">{user.fullName || user.username}</p>
              <p className="text-xs text-zinc-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            
            <div className="p-2">
              <Link 
                href={`/u/${user.id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link 
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>
            </div>

            <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
