"use client";

import { useState, useEffect, useCallback } from "react";
import { searchGamesAction, getPopularGamesAction } from "@/app/actions";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/utils";
import { GameGridSkeleton } from "@/components/ui";
import GameDetailsModal from "./game-details-modal";
import type { ProcessedIGDBGame } from "@/types";

export default function GameSearch() {
  // State variables to store what the user types, the results, and loading status
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<ProcessedIGDBGame[]>([]);
  const [popularGames, setPopularGames] = useState<ProcessedIGDBGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState<ProcessedIGDBGame | null>(null);
  const [offset, setOffset] = useState(0);

  // Debounce search query (300ms delay)
  const debouncedQuery = useDebounce(query, 300);

  // Fetch popular games on mount or when offset changes
  useEffect(() => {
    const fetchPopular = async () => {
      setPopularLoading(true);
      const results = await getPopularGamesAction(offset);
      setPopularGames(results);
      setPopularLoading(false);
    };
    fetchPopular();
  }, [offset]);

  // Auto-search when debounced query changes (live search)
  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedQuery.trim()) {
        setGames([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const results = await searchGamesAction(debouncedQuery);
        setGames(results);
        if (results.length === 0) {
          setError("No games found. Try a different search term.");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    searchGames();
  }, [debouncedQuery]);

  // Handle manual form submission (for Enter key)
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // The search already happens via debounce, 
    // but we can trigger immediate search on Enter
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const results = await searchGamesAction(query);
      setGames(results);
      if (results.length === 0) {
        setError("No games found. Try a different search term.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const displayGames = query.trim() ? games : popularGames;
  const isPopular = !query.trim();
  const isLoading = query.trim() ? loading : popularLoading;

  return (
    <div className="w-full max-w-4xl">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a game..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="text-center text-red-500 mb-8">
          {error}
        </div>
      )}

      {isPopular && !popularLoading && popularGames.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Right Now</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setOffset(Math.max(0, offset - 12))}
              disabled={offset === 0}
              className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setOffset(offset + 12)}
              className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <GameGridSkeleton count={12} />
      )}

      {/* Results Grid */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900/50 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg group overflow-hidden"
            >
              {/* Game Cover Image */}
              <div className="relative aspect-[3/4] w-full bg-gray-200 dark:bg-gray-800">
                {game.coverUrl ? (
                  <Image
                    src={game.coverUrl}
                    alt={game.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-center p-2 text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              {/* Game Details */}
              <div className="p-3 flex flex-col gap-1">
                <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {game.name}
                </h3>
                {game.first_release_date && (
                  <p className="text-xs text-gray-500">
                    {new Date(game.first_release_date * 1000).getFullYear()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedGame && (
        <GameDetailsModal 
          game={selectedGame} 
          onClose={() => setSelectedGame(null)} 
        />
      )}
    </div>
  );
}
