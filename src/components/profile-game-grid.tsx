"use client";

import { useState } from "react";
import Image from "next/image";
import GameDetailsModal from "./game-details-modal";

interface ProfileGameGridProps {
  games: any[];
}

type SortOption = "date" | "name" | "rating";

export default function ProfileGameGrid({ games }: ProfileGameGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [cardSize, setCardSize] = useState(1); // 0: Small, 1: Medium, 2: Large

  const getSortedGames = (gamesList: any[]) => {
    return [...gamesList].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Default: date added (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getGridClass = () => {
    switch (cardSize) {
      case 0: return "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"; // Small
      case 2: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"; // Large
      default: return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"; // Medium (Default)
    }
  };

  const groupedGames = {
    PLAYING: getSortedGames(games.filter((g) => g.status === "PLAYING")),
    COMPLETED: getSortedGames(games.filter((g) => g.status === "COMPLETED")),
    PLANNING: getSortedGames(games.filter((g) => g.status === "PLANNING")),
    DROPPED: getSortedGames(games.filter((g) => g.status === "DROPPED")),
  };

  const sections = [
    { id: "PLAYING", title: "Currently Playing", icon: "🎮" },
    { id: "COMPLETED", title: "Completed", icon: "🏆" },
    { id: "PLANNING", title: "Plan to Play", icon: "📅" },
    { id: "DROPPED", title: "Abandoned", icon: "💀" },
  ];

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-end mb-8 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Size:</span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded p-1">
            <button 
              onClick={() => setCardSize(0)}
              className={`p-1.5 rounded ${cardSize === 0 ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Small"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button 
              onClick={() => setCardSize(1)}
              className={`p-1.5 rounded ${cardSize === 1 ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            </button>
            <button 
              onClick={() => setCardSize(2)}
              className={`p-1.5 rounded ${cardSize === 2 ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Large"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            aria-label="Sort games by"
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm"
          >
            <option value="date">Date Added</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="space-y-12">
        {sections.map((section) => {
          const sectionGames = groupedGames[section.id as keyof typeof groupedGames];
          if (sectionGames.length === 0) return null;

          return (
            <section key={section.id}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <span>{section.icon}</span>
                {section.title}
                <span className="text-sm font-normal text-gray-500 ml-auto">
                  {sectionGames.length}
                </span>
              </h2>
              
              <div className={`grid gap-4 w-full ${getGridClass()}`}>
                {sectionGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="relative aspect-[3/4] w-full bg-gray-200 dark:bg-gray-800">
                      {game.coverUrl ? (
                        <Image
                          src={game.coverUrl}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                      {game.rating && game.rating > 0 && (
                        <div className="absolute top-1 right-1 bg-yellow-500 text-black font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                          <span>★</span> {game.rating / 20}
                        </div>
                      )}
                    </div>
                    
                    {cardSize > 0 && (
                      <div className="p-3 flex flex-col gap-1 flex-1">
                        <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {game.name}
                        </h3>
                        
                        {game.review && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                            "{game.review}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selectedGame && (
        <GameDetailsModal 
          game={selectedGame} 
          onClose={() => {
            setSelectedGame(null);
            // Optional: Refresh page to show updated status? 
            // Since this is a client component with initial data, updates won't show immediately unless we manage state locally or refresh.
            // For simplicity, we can trigger a router refresh.
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}
