"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toggleFollow } from "@/app/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  followerCount: number;
  className?: string;
  variant?: "default" | "compact";
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  followerCount,
  className,
  variant = "default"
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [count, setCount] = useState(followerCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.following !== undefined) {
        setIsFollowing(result.following);
        setCount(prev => result.following ? prev + 1 : prev - 1);
        toast.success(result.following ? "Following!" : "Unfollowed");
      }
    });
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "p-2 rounded-lg transition-colors",
          isFollowing
            ? "bg-zinc-700 text-white hover:bg-red-600"
            : "bg-blue-600 text-white hover:bg-blue-700",
          isPending && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isFollowing ? "Unfollow" : "Follow"}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          <UserMinus className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
        isFollowing
          ? "bg-zinc-700 text-white hover:bg-red-600 group"
          : "bg-blue-600 text-white hover:bg-blue-700",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
      {count > 0 && (
        <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
          {count}
        </span>
      )}
    </button>
  );
}
