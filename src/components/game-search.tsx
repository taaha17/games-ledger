"use client";

import { useState, useEffect } from "react";
import { searchGamesAction, getPopularGamesAction } from "@/app/actions";
import Image from "next/image";
import GameDetailsModal from "./game-details-modal";

export default function GameSearch() {
  // State variables to store what the user types, the results, and loading status
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [popularGames, setPopularGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [offset, setOffset] = useState(0);

  // Fetch popular games on mount or when offset changes
  useEffect(() => {
    const fetchPopular = async () => {
      const results = await getPopularGamesAction(offset);
      setPopularGames(results);
    };
    fetchPopular();
  }, [offset]);

  // This function runs when the user hits "Search"
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading
    if (!query.trim()) return; // Don't search if the box is empty

    setLoading(true); // Show "Searching..." text
    setError("");
    try {
      const results = await searchGamesAction(query); // Call our server action
      setGames(results); // Save the results to display them
      if (results.length === 0) {
        setError("No games found. Try a different search term.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Hide "Searching..." text
    }
  };

  const displayGames = query.trim() ? games : popularGames;
  const isPopular = !query.trim();

  return (
    <div className="w-full max-w-4xl">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) {
              setGames([]);
              setError("");
            }
          }}
          placeholder="Search for a game..."
          className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="text-center text-red-500 mb-8">
          {error}
        </div>
      )}

      {isPopular && popularGames.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-center">Popular Right Now</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setOffset(Math.max(0, offset - 12))}
              disabled={offset === 0}
              className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button 
              onClick={() => setOffset(offset + 12)}
              className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      )}

      {/* Results Grid */}
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
