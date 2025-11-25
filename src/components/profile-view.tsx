"use client";

import { useState } from "react";
import Image from "next/image";
import { toggleFavorite } from "@/app/actions";
import { toast } from "sonner";
import { Edit2, Share2, Gamepad2, Star, Heart, MessageSquare } from "lucide-react";
import { 
  SiSteam, 
  SiPlaystation, 
  SiNintendoswitch, 
  SiEa, 
  SiUbisoft, 
  SiGogdotcom, 
  SiX, 
  SiInstagram, 
  SiDiscord, 
  SiTwitch, 
  SiYoutube 
} from "react-icons/si";
import { FaXbox } from "react-icons/fa";
import EditProfileModal from "./edit-profile-modal";
import ProfileGameGrid from "./profile-game-grid";
import GameDetailsModal from "./game-details-modal";

interface ProfileViewProps {
  user: any;
  dbUser: any;
  games: any[];
  isOwner: boolean;
}

export default function ProfileView({ user, dbUser, games, isOwner }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);

  const stats = {
    total: games.length,
    completed: games.filter(g => g.status === "COMPLETED").length,
    playing: games.filter(g => g.status === "PLAYING").length,
    backlog: games.filter(g => g.status === "PLANNING").length,
  };

  const favorites = games.filter(g => g.isFavorite).slice(0, 5);
  const recentReviews = games
    .filter(g => g.review && g.review.length > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const copyLink = () => {
    const url = `${window.location.origin}/u/${dbUser.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
  };

  const handleToggleFavorite = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    if (!isOwner) return;
    
    const res = await toggleFavorite(gameId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Favorites updated");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-zinc-100 font-sans">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full bg-zinc-900 overflow-hidden">
        {dbUser?.headerUrl ? (
          <Image
            src={dbUser.headerUrl}
            alt="Header"
            fill
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-[#161616] overflow-hidden bg-zinc-800 shadow-2xl">
              <Image
                src={dbUser?.avatarUrl || user.imageUrl}
                alt={user.fullName || "User"}
                fill
                className="object-cover"
              />
            </div>
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-700"
                aria-label="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 mb-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold text-white drop-shadow-md">
                {user.fullName || user.username}
              </h1>
              {/* Gamertags & Socials */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                {/* Gamertags */}
                {dbUser?.steamId && (
                  <div className="p-1.5 bg-[#171a21] rounded text-white hover:scale-110 transition-transform cursor-help" title={`Steam: ${dbUser.steamId}`}>
                    <SiSteam className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.psnId && (
                  <div className="p-1.5 bg-[#003087] rounded text-white hover:scale-110 transition-transform cursor-help" title={`PSN: ${dbUser.psnId}`}>
                    <SiPlaystation className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.xboxGamertag && (
                  <div className="p-1.5 bg-[#107C10] rounded text-white hover:scale-110 transition-transform cursor-help" title={`Xbox: ${dbUser.xboxGamertag}`}>
                    <FaXbox className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.nintendoFriendCode && (
                  <div className="p-1.5 bg-[#e60012] rounded text-white hover:scale-110 transition-transform cursor-help" title={`Nintendo: ${dbUser.nintendoFriendCode}`}>
                    <SiNintendoswitch className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.eaId && (
                  <div className="p-1.5 bg-[#FF4747] rounded text-white hover:scale-110 transition-transform cursor-help" title={`EA: ${dbUser.eaId}`}>
                    <SiEa className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.ubisoftId && (
                  <div className="p-1.5 bg-[#0091DA] rounded text-white hover:scale-110 transition-transform cursor-help" title={`Ubisoft: ${dbUser.ubisoftId}`}>
                    <SiUbisoft className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.gogId && (
                  <div className="p-1.5 bg-[#5c2e91] rounded text-white hover:scale-110 transition-transform cursor-help" title={`GOG: ${dbUser.gogId}`}>
                    <SiGogdotcom className="w-4 h-4" />
                  </div>
                )}

                {/* Divider if both exist */}
                {(dbUser?.steamId || dbUser?.psnId || dbUser?.xboxGamertag || dbUser?.nintendoFriendCode || dbUser?.eaId || dbUser?.ubisoftId || dbUser?.gogId) && 
                 (dbUser?.twitter || dbUser?.instagram || dbUser?.discord || dbUser?.twitch || dbUser?.youtube) && (
                  <div className="w-px h-6 bg-zinc-700 mx-1" />
                )}

                {/* Socials */}
                {dbUser?.twitter && (
                  <a href={`https://twitter.com/${dbUser.twitter}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-1.5 bg-black rounded text-white hover:scale-110 transition-transform">
                    <SiX className="w-4 h-4" />
                  </a>
                )}
                {dbUser?.instagram && (
                  <a href={`https://instagram.com/${dbUser.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-1.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded text-white hover:scale-110 transition-transform">
                    <SiInstagram className="w-4 h-4" />
                  </a>
                )}
                {dbUser?.discord && (
                  <div className="p-1.5 bg-[#5865F2] rounded text-white hover:scale-110 transition-transform cursor-help" title={`Discord: ${dbUser.discord}`}>
                    <SiDiscord className="w-4 h-4" />
                  </div>
                )}
                {dbUser?.twitch && (
                  <a href={`https://twitch.tv/${dbUser.twitch}`} target="_blank" rel="noopener noreferrer" aria-label="Twitch" className="p-1.5 bg-[#9146FF] rounded text-white hover:scale-110 transition-transform">
                    <SiTwitch className="w-4 h-4" />
                  </a>
                )}
                {dbUser?.youtube && (
                  <a href={`https://youtube.com/@${dbUser.youtube}`} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-1.5 bg-[#FF0000] rounded text-white hover:scale-110 transition-transform">
                    <SiYoutube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed mb-4">
              {dbUser?.bio || "No bio yet."}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-4 shrink-0 justify-center w-full md:w-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.backlog}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Backlog</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Favorites & Reviews */}
          <div className="space-y-8">
            {/* Favorite Games */}
            <div className="bg-[#202020] rounded-xl p-6 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Favorite Games
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {favorites.map((game) => (
                  <div 
                    key={game.id} 
                    className="relative aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedGame(game)}
                  >
                    {game.coverUrl ? (
                      <Image
                        src={game.coverUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
                ))}
                {Array.from({ length: 5 - favorites.length }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center">
                    <span className="text-zinc-700 text-xs font-medium">Empty</span>
                  </div>
                ))}
              </div>
              {isOwner && favorites.length < 5 && (
                <p className="text-xs text-zinc-500 mt-3 text-center">
                  Mark games as favorite to show them here.
                </p>
              )}
            </div>

            {/* Recent Reviews */}
            {recentReviews.length > 0 && (
              <div className="bg-[#202020] rounded-xl p-6 border border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {recentReviews.map((game) => (
                    <div key={game.id} className="flex gap-4 group cursor-pointer" onClick={() => setSelectedGame(game)}>
                      <div className="relative w-16 h-24 shrink-0 rounded bg-zinc-800 overflow-hidden">
                        {game.coverUrl && (
                          <Image src={game.coverUrl} alt={game.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{game.name}</h4>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{game.rating ? game.rating / 20 : 0}</span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2 italic">"{game.review}"</p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {new Date(game.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Full Library */}
          <div className="lg:col-span-2">
            <div className="bg-[#202020] rounded-xl p-6 border border-zinc-800 min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-purple-500" />
                  Library
                </h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                  {games.length} Games
                </span>
              </div>
              
              <ProfileGameGrid games={games} />
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditProfileModal 
          user={dbUser} 
          onClose={() => setIsEditing(false)} 
        />
      )}

      {selectedGame && (
        <GameDetailsModal 
          game={selectedGame} 
          onClose={() => setSelectedGame(null)} 
        />
      )}
    </div>
  );
}
