"use client";

import { useMemo } from "react";
import { 
  Gamepad2, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Calendar,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LibraryGame } from "@/types";

interface StatsCardProps {
  games: LibraryGame[];
  className?: string;
}

export default function StatsCard({ games, className }: StatsCardProps) {
  const stats = useMemo(() => {
    // basic counts
    const total = games.length;
    const completed = games.filter(g => g.status === "COMPLETED").length;
    const playing = games.filter(g => g.status === "PLAYING").length;
    const backlog = games.filter(g => g.status === "PLANNING").length;
    const dropped = games.filter(g => g.status === "DROPPED").length;

    // completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // average rating (for rated games only)
    const ratedGames = games.filter(g => g.rating && g.rating > 0);
    const avgRating = ratedGames.length > 0
      ? ratedGames.reduce((sum, g) => sum + (g.rating || 0), 0) / ratedGames.length / 20 // convert to 0-5 scale
      : 0;

    // games added this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const addedThisMonth = games.filter(g => new Date(g.createdAt) >= thisMonth).length;

    // favorite genres (from comma-separated string)
    const genreCounts: Record<string, number> = {};
    games.forEach(game => {
      if (game.genres) {
        game.genres.split(", ").forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // favorite platforms
    const platformCounts: Record<string, number> = {};
    games.forEach(game => {
      if (game.platforms) {
        game.platforms.split(", ").forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
      }
    });
    const topPlatforms = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([platform]) => platform);

    return {
      total,
      completed,
      playing,
      backlog,
      dropped,
      completionRate,
      avgRating,
      addedThisMonth,
      topGenres,
      topPlatforms,
      ratedCount: ratedGames.length,
    };
  }, [games]);

  return (
    <div className={cn("bg-[#202020] rounded-xl p-6 border border-zinc-800", className)}>
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-500" />
        Gaming Stats
      </h3>

      {/* main stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <Gamepad2 className="w-3 h-3" />
            Total Games
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <Trophy className="w-3 h-3 text-green-500" />
            Completed
          </div>
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <Clock className="w-3 h-3 text-blue-500" />
            Playing
          </div>
          <div className="text-2xl font-bold text-blue-500">{stats.playing}</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <Calendar className="w-3 h-3 text-purple-500" />
            This Month
          </div>
          <div className="text-2xl font-bold text-purple-500">{stats.addedThisMonth}</div>
        </div>
      </div>

      {/* completion rate bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-zinc-400">Completion Rate</span>
          <span className="text-white font-bold">{stats.completionRate}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* average rating */}
      {stats.ratedCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-400">Average Rating</span>
            <span className="text-yellow-500 font-bold flex items-center gap-1">
              <span>★</span> {stats.avgRating.toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-zinc-500">
            Based on {stats.ratedCount} rated games
          </div>
        </div>
      )}

      {/* top genres */}
      {stats.topGenres.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Top Genres
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.topGenres.map(genre => (
              <span 
                key={genre}
                className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* top platforms */}
      {stats.topPlatforms.length > 0 && (
        <div>
          <div className="text-sm text-zinc-400 mb-2">Top Platforms</div>
          <div className="flex flex-wrap gap-2">
            {stats.topPlatforms.map(platform => (
              <span 
                key={platform}
                className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* status breakdown */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-green-500">{stats.completed}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-500">{stats.playing}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Playing</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-500">{stats.backlog}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Backlog</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">{stats.dropped}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Dropped</div>
          </div>
        </div>
      </div>
    </div>
  );
}
