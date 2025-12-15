"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Gamepad2, 
  Star, 
  UserPlus, 
  Heart, 
  CheckCircle,
  Loader2 
} from "lucide-react";
import { getUserActivity, getFollowingActivity } from "@/app/actions";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

interface ActivityFeedProps {
  userId?: string;
  showFollowing?: boolean;
  limit?: number;
  className?: string;
}

// get icon and color for each activity type
const getActivityStyle = (type: string) => {
  switch (type) {
    case "ADD_GAME":
      return { icon: Gamepad2, color: "text-blue-500", bg: "bg-blue-500/10" };
    case "COMPLETE_GAME":
      return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" };
    case "REVIEW":
      return { icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" };
    case "FOLLOW":
      return { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-500/10" };
    case "FAVORITE":
      return { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" };
    default:
      return { icon: Gamepad2, color: "text-zinc-500", bg: "bg-zinc-500/10" };
  }
};

// generate human-readable description
const getActivityDescription = (type: string, metadata: Record<string, unknown>): string => {
  const gameName = typeof metadata.gameName === 'string' ? metadata.gameName : "a game";
  
  switch (type) {
    case "ADD_GAME":
      return `added ${gameName} to their library`;
    case "COMPLETE_GAME":
      return `completed ${gameName}`;
    case "REVIEW":
      return `reviewed ${gameName}`;
    case "FOLLOW":
      return `started following someone`;
    case "FAVORITE":
      return `favorited ${gameName}`;
    default:
      return "did something";
  }
};

export default function ActivityFeed({ 
  userId, 
  showFollowing = false,
  limit = 10,
  className 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadActivities();
  }, [userId, showFollowing]);

  const loadActivities = async (pageNum = 1) => {
    setLoading(true);
    try {
      const result = showFollowing
        ? await getFollowingActivity(pageNum, limit)
        : userId
          ? await getUserActivity(userId, pageNum, limit)
          : { activities: [], hasMore: false };

      if (pageNum === 1) {
        setActivities(result.activities as ActivityItem[]);
      } else {
        setActivities(prev => [...prev, ...(result.activities as ActivityItem[])]);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadActivities(page + 1);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-8 text-zinc-500", className)}>
        <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity) => {
        const style = getActivityStyle(activity.type);
        const Icon = style.icon;
        const metadata: Record<string, unknown> = activity.metadata || {};
        const coverUrl = typeof metadata.coverUrl === 'string' ? metadata.coverUrl : null;
        const gameName = typeof metadata.gameName === 'string' ? metadata.gameName : "Game";

        return (
          <div 
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-[#202020] rounded-lg border border-zinc-800"
          >
            {/* user avatar */}
            <Link href={`/u/${activity.user.username || activity.user.id}`}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-700 shrink-0">
                {activity.user.avatarUrl ? (
                  <Image
                    src={activity.user.avatarUrl}
                    alt={activity.user.username || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                    {(activity.user.username || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
            </Link>

            {/* activity content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300">
                <Link 
                  href={`/u/${activity.user.username || activity.user.id}`}
                  className="font-medium text-white hover:text-blue-400 transition-colors"
                >
                  {activity.user.username || "Anonymous"}
                </Link>
                {" "}
                {getActivityDescription(activity.type, metadata)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* activity type icon */}
            <div className={cn("p-2 rounded-full", style.bg)}>
              <Icon className={cn("w-4 h-4", style.color)} />
            </div>

            {/* game cover if available */}
            {coverUrl && (
              <div className="relative w-12 h-16 rounded overflow-hidden bg-zinc-800 shrink-0">
                <Image
                  src={coverUrl}
                  alt={gameName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* load more button */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2 text-center text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            "Load more"
          )}
        </button>
      )}
    </div>
  );
}
