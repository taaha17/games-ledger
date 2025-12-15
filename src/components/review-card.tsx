"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  AlertTriangle,
  ChevronUp,
  MoreHorizontal,
  Flag,
  Edit2,
  Trash2
} from "lucide-react";
import StarRating from "./star-rating";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review & {
    user: {
      id: string;
      username: string | null;
      avatarUrl: string | null;
    };
    _count?: {
      votes: number;
      replies: number;
    };
    userVote?: "up" | "down" | null;
  };
  currentUserId?: string;
  onVote?: (reviewId: string, isUpvote: boolean) => Promise<void>;
  onReply?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

export default function ReviewCard({
  review,
  currentUserId,
  onVote,
  onReply,
  onEdit,
  onDelete,
  onReport
}: ReviewCardProps) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const isOwner = currentUserId === review.userId;
  const upvotes = review.upvotes || 0;
  const replyCount = review._count?.replies || 0;

  const handleVote = async (isUpvote: boolean) => {
    if (!onVote || isVoting) return;
    setIsVoting(true);
    try {
      await onVote(review.id, isUpvote);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-[#202020] rounded-xl p-4 border border-zinc-800">
      {/* header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-700 shrink-0">
          {review.user.avatarUrl ? (
            <Image
              src={review.user.avatarUrl}
              alt={review.user.username || "User"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
              {(review.user.username || "U")[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">
              {review.user.username || "Anonymous"}
            </span>
            <span className="text-zinc-500 text-sm">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
          <StarRating rating={review.rating} readonly size="sm" showValue={false} />
        </div>

        {/* menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-zinc-500 hover:text-white rounded transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 mt-1 w-40 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 overflow-hidden z-20">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => { onEdit?.(review.id); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => { onDelete?.(review.id); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { onReport?.(review.id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* spoiler warning or content */}
      {review.hasSpoilers && !showSpoiler ? (
        <button
          onClick={() => setShowSpoiler(true)}
          className="w-full py-6 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col items-center gap-2 text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          <AlertTriangle className="w-6 h-6" />
          <span className="text-sm font-medium">This review contains spoilers</span>
          <span className="text-xs text-amber-500/70">Click to reveal</span>
        </button>
      ) : (
        <div className="space-y-3">
          {review.content && (
            <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
              {review.content}
            </p>
          )}

          {review.hasSpoilers && showSpoiler && (
            <button
              onClick={() => setShowSpoiler(false)}
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
              <ChevronUp className="w-3 h-3" />
              Hide spoilers
            </button>
          )}
        </div>
      )}

      {/* footer actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800">
        {/* vote buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting || !currentUserId}
            className={cn(
              "p-1.5 rounded transition-colors",
              review.userVote === "up"
                ? "text-green-500 bg-green-500/20"
                : "text-zinc-500 hover:text-green-500 hover:bg-green-500/10",
              (!currentUserId || isVoting) && "opacity-50 cursor-not-allowed"
            )}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-zinc-400 min-w-[20px] text-center">
            {upvotes}
          </span>
          
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting || !currentUserId}
            className={cn(
              "p-1.5 rounded transition-colors",
              review.userVote === "down"
                ? "text-red-500 bg-red-500/20"
                : "text-zinc-500 hover:text-red-500 hover:bg-red-500/10",
              (!currentUserId || isVoting) && "opacity-50 cursor-not-allowed"
            )}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>

        {/* reply button */}
        <button
          onClick={() => onReply?.(review.id)}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{replyCount > 0 ? `${replyCount} replies` : "Reply"}</span>
        </button>
      </div>
    </div>
  );
}
