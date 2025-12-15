"use client";

import { useState } from "react";
import { AlertTriangle, Send, Eye, EyeOff } from "lucide-react";
import StarRating from "./star-rating";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  gameId: string;
  gameName: string;
  initialRating?: number;
  initialContent?: string;
  initialHasSpoilers?: boolean;
  onSubmit: (data: { rating: number; content: string; hasSpoilers: boolean }) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function ReviewForm({
  gameId,
  gameName,
  initialRating = 0,
  initialContent = "",
  initialHasSpoilers = false,
  onSubmit,
  onCancel,
  isEditing = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [hasSpoilers, setHasSpoilers] = useState(initialHasSpoilers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return; // require at least some rating
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, content, hasSpoilers });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* rating section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">
          Your Rating
        </label>
        <StarRating 
          rating={rating} 
          onChange={setRating}
          size="lg"
        />
      </div>

      {/* review content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            Review (optional)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        
        {showPreview ? (
          <div className="min-h-[120px] p-3 bg-zinc-800 rounded-lg text-zinc-300 text-sm whitespace-pre-wrap">
            {content || <span className="text-zinc-500 italic">No review content</span>}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What did you think of ${gameName}?`}
            className="w-full min-h-[120px] p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            maxLength={2000}
          />
        )}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{content.length}/2000 characters</span>
        </div>
      </div>

      {/* spoiler toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setHasSpoilers(!hasSpoilers)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            hasSpoilers 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
              : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Contains Spoilers
        </button>
        {hasSpoilers && (
          <span className="text-xs text-amber-500">
            Review will be hidden by default
          </span>
        )}
      </div>

      {/* submit buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
            rating === 0
              ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {isEditing ? "Update Review" : "Post Review"}
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {rating === 0 && (
        <p className="text-xs text-zinc-500">
          Select a rating to post your review
        </p>
      )}
    </form>
  );
}
