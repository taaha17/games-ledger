"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addToLibrary, removeFromLibrary, getGameDetailsAction, toggleFavorite } from "@/app/actions";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Star, Users, Building2, Gamepad2, Clock, Image as ImageIcon, Heart } from "lucide-react";
import type { ProcessedIGDBGame, LibraryGame, GameStatus, TabOption, ModalStep } from "@/types";

interface GameDetailsModalProps {
  game: ProcessedIGDBGame | LibraryGame;
  onClose: () => void;
}

export default function GameDetailsModal({ game: initialGame, onClose }: GameDetailsModalProps) {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const [game, setGame] = useState<ProcessedIGDBGame | LibraryGame>(initialGame);
  const [fullDetails, setFullDetails] = useState<ProcessedIGDBGame | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>("overview");
  const [step, setStep] = useState<ModalStep>("details");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Type guards for checking game type
  const isLibraryGameType = (g: ProcessedIGDBGame | LibraryGame): g is LibraryGame => {
    return typeof g.id === 'string' && 'userId' in g;
  };

  // Determine if we are editing an existing library entry
  // We only consider it a library game if it belongs to the current user
  const gameUserId = isLibraryGameType(game) ? game.userId : null;
  const isOwner = userId && gameUserId === userId;
  const isLibraryGame = isLibraryGameType(game) && Boolean(game.status) && isOwner;

  // Form State - only pre-fill if it's our game
  const [status, setStatus] = useState<GameStatus>(
    isOwner && isLibraryGameType(game) ? (game.status || "PLANNING") : "PLANNING"
  );
  const [rating, setRating] = useState(
    isOwner && isLibraryGameType(game) ? (game.rating || 0) : 0
  );
  // reviews are now in a separate model, this is just for the inline review input
  // todo: replace this with proper review system
  const [review, setReview] = useState("");
  const [isFavorite, setIsFavorite] = useState(
    isOwner && isLibraryGameType(game) ? (game.isFavorite || false) : false
  );

  useEffect(() => {
    const fetchDetails = async () => {
      const igdbId = isLibraryGameType(game) ? game.igdbId : game.id;
      if (typeof igdbId === 'number') {
        const details = await getGameDetailsAction(igdbId);
        if (details) {
          setFullDetails(details);
        }
      }
    };
    fetchDetails();
  }, [game]);

  const handleSave = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to add games.");
      return;
    }

    setLoading(true);
    const result = await addToLibrary(game, {
      status,
      rating: status === "COMPLETED" || status === "DROPPED" || status === "PLAYING" ? rating : undefined,
      review: status === "COMPLETED" || status === "DROPPED" || status === "PLAYING" ? review : undefined,
    });
    
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isLibraryGame ? "Game updated!" : "Added to library!");
      onClose();
      router.refresh();
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLibraryGame || !isLibraryGameType(game)) return;
    const res = await toggleFavorite(game.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this game from your library?")) return;
    if (!isLibraryGameType(game)) return;
    
    setRemoving(true);
    const result = await removeFromLibrary(game.id);
    setRemoving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Game removed from library");
      onClose();
      router.refresh(); // Use Next.js router.refresh() instead of window.location.reload()
    }
  };

  const renderTags = (items: any, colorClass: string) => {
    if (!items) return null;
    let list: string[] = [];
    if (Array.isArray(items)) {
      list = items.map((i: any) => i.name);
    } else if (typeof items === "string") {
      list = items.split(", ");
    }
    return list.map((name, i) => (
      <span key={i} className={`px-3 py-1 text-xs rounded-full font-medium ${colorClass}`}>
        {name}
      </span>
    ));
  };

  const displayGame = fullDetails || game;
  
  // Helper to get IGDB-specific properties (only available on ProcessedIGDBGame or fullDetails)
  const getIGDBDetails = () => fullDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
        
        {/* Header Image */}
        <div className="relative h-64 sm:h-80 w-full bg-zinc-900 shrink-0">
          {displayGame.coverUrl ? (
            <Image
              src={('screenshots' in displayGame && displayGame.screenshots?.[0]?.url?.replace("t_screenshot_med", "t_screenshot_huge")) || displayGame.coverUrl.replace("t_cover_big", "t_screenshot_huge")}
              alt={displayGame.name}
              fill
              className="object-cover opacity-40"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end gap-6">
             {displayGame.coverUrl && (
                <Image
                  src={displayGame.coverUrl}
                  alt={displayGame.name}
                  width={140}
                  height={200}
                  className="rounded-lg shadow-2xl hidden sm:block border-4 border-white dark:border-zinc-900"
                />
             )}
             <div className="flex-1 mb-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white leading-tight drop-shadow-lg">
                  {displayGame.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {'first_release_date' in displayGame && displayGame.first_release_date && (
                    <span className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
                      <Calendar className="w-4 h-4" />
                      {new Date(displayGame.first_release_date * 1000).getFullYear()}
                    </span>
                  )}
                  {'aggregated_rating' in displayGame && displayGame.aggregated_rating && (
                    <span className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-1 rounded text-yellow-600 dark:text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      {Math.round(displayGame.aggregated_rating)} Critic
                    </span>
                  )}
                  {'rating' in displayGame && displayGame.rating && typeof displayGame.rating === 'number' && !('userId' in displayGame) && (
                    <span className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-1 rounded text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                      {Math.round(displayGame.rating)} User
                    </span>
                  )}
                </div>
             </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
          <div className="p-6 sm:p-8">
            {step === "details" ? (
              <>
                {/* Tabs */}
                <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                  {["overview", "media", "similar"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${
                        activeTab === tab 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              About
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-base">
                              {displayGame.summary || "No description available."}
                            </p>
                          </div>
                          
                          {'involved_companies' in displayGame && displayGame.involved_companies && (
                            <div>
                              <h3 className="text-sm font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Developers</h3>
                              <div className="flex flex-wrap gap-2">
                                {displayGame.involved_companies.map((c, i: number) => (
                                  <span key={i} className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md text-sm">
                                    <Building2 className="w-4 h-4" />
                                    {c.company.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* show rating if viewing someone else's game */}
                          {!isOwner && 'rating' in game && game.rating && (
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                              <h3 className="text-sm font-semibold text-zinc-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                User Rating
                              </h3>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{game.rating / 20}/5</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                              {renderTags(displayGame.genres, "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300")}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Platforms</h3>
                            <div className="flex flex-wrap gap-2">
                              {renderTags(displayGame.platforms, "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300")}
                            </div>
                          </div>

                          <button
                            onClick={() => setStep("form")}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                          >
                            <Gamepad2 className="w-5 h-5" />
                            {isLibraryGame ? "Update Status" : "Add to Library"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "media" && (
                    <motion.div 
                      key="media"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {'screenshots' in displayGame && displayGame.screenshots?.map((shot, i: number) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 group">
                          {shot.url && (
                            <Image
                              src={shot.url}
                              alt="Screenshot"
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                      )) || (
                        <div className="col-span-full py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                          <ImageIcon className="w-8 h-8 opacity-50" />
                          <p>No screenshots available</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "similar" && (
                    <motion.div 
                      key="similar"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                      {'similar_games' in displayGame && displayGame.similar_games?.map((sim) => (
                        <div 
                          key={sim.id} 
                          onClick={() => {
                            setGame(sim);
                            setFullDetails(null);
                            setActiveTab("overview");
                          }}
                          className="group cursor-pointer space-y-2"
                        >
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-800">
                            {sim.coverUrl ? (
                              <Image
                                src={sim.coverUrl}
                                alt={sim.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                <Gamepad2 className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate group-hover:text-blue-500 transition-colors">{sim.name}</p>
                        </div>
                      )) || (
                        <div className="col-span-full py-12 text-center text-zinc-500">
                          No similar games found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{isLibraryGame ? "Update Entry" : "Add to Library"}</h3>
                  <div className="flex items-center gap-4">
                    {isLibraryGame && (
                      <button
                        onClick={handleToggleFavorite}
                        className={`p-2 rounded-full transition-colors ${
                          isFavorite ? "bg-red-500/10 text-red-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500"
                        }`}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                      </button>
                    )}
                    <button onClick={() => setStep("details")} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wider">Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: "PLANNING" as GameStatus, label: "Plan to Play", icon: "📅" },
                      { id: "PLAYING" as GameStatus, label: "Playing", icon: "🎮" },
                      { id: "COMPLETED" as GameStatus, label: "Completed", icon: "🏆" },
                      { id: "DROPPED" as GameStatus, label: "Dropped", icon: "💀" },
                    ]).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setStatus(option.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          status === option.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating & Review */}
                {(status === "COMPLETED" || status === "PLAYING" || status === "DROPPED") && (
                  <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wider">Rating</label>
                      <div className="flex flex-col items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starIndex) => {
                            const fullValue = starIndex * 20;
                            const halfValue = fullValue - 10;
                            
                            return (
                              <div key={starIndex} className="relative cursor-pointer w-8 h-8">
                                {/* Base Empty Star */}
                                <Star className="absolute inset-0 w-full h-full text-zinc-300 dark:text-zinc-700" />
                                
                                {/* Half Filled Star */}
                                {rating >= halfValue && (
                                  <div className="absolute inset-0 overflow-hidden w-[50%]">
                                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                                  </div>
                                )}
                                
                                {/* Full Filled Star */}
                                {rating >= fullValue && (
                                  <Star className="absolute inset-0 w-full h-full text-yellow-400 fill-yellow-400" />
                                )}

                                {/* Click Targets */}
                                <button 
                                  className="absolute left-0 top-0 w-1/2 h-full opacity-0 z-10"
                                  onClick={() => setRating(halfValue)}
                                  type="button"
                                  aria-label={`Rate ${starIndex - 0.5} stars`}
                                />
                                <button 
                                  className="absolute right-0 top-0 w-1/2 h-full opacity-0 z-10"
                                  onClick={() => setRating(fullValue)}
                                  type="button"
                                  aria-label={`Rate ${starIndex} stars`}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {rating > 0 ? `${rating / 20} Stars` : "No Rating"}
                          </span>
                          {rating > 0 && (
                            <button 
                              onClick={() => setRating(0)}
                              className="text-zinc-400 hover:text-red-500 transition-colors text-xs uppercase tracking-wider font-semibold"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wider">Review</label>
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Write your thoughts..."
                        className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={loading || removing}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : (isLibraryGame ? "Save Changes" : "Add Game")}
                  </button>
                  
                  {isLibraryGame && (
                    <button
                      onClick={handleRemove}
                      disabled={loading || removing}
                      className="w-full py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {removing ? "Removing..." : "Remove from Library"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

