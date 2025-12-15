// ============================================
// gamesled type definitions
// ============================================
// all our typescript types in one place
// import these wherever you need type safety

// ============================================
// game status
// ============================================
// the four states a game can be in your library
// pretty self-explanatory
export type GameStatus = 'PLANNING' | 'PLAYING' | 'COMPLETED' | 'DROPPED';

// ============================================
// igdb api types
// ============================================
// these match what igdb sends us back from their api
// we transform these into our own types before using them

// game cover art - igdb gives us a url with a size placeholder
export interface IGDBCover {
  id: number;
  url: string;
}

// genre like "action", "rpg", "shooter", etc
export interface IGDBGenre {
  id: number;
  name: string;
}

// gaming platforms - ps5, xbox, pc, switch, etc
export interface IGDBPlatform {
  id: number;
  name: string;
}

// in-game screenshots
export interface IGDBScreenshot {
  id: number;
  url: string;
}

// development companies associated with a game
export interface IGDBCompany {
  company: {
    id: number;
    name: string;
  };
}

// the raw game object from igdb
// has a bunch of optional fields since not every game has everything
export interface IGDBGame {
  id: number;
  name: string;
  cover?: IGDBCover;
  first_release_date?: number;  // unix timestamp
  summary?: string;
  genres?: IGDBGenre[];
  platforms?: IGDBPlatform[];
  screenshots?: IGDBScreenshot[];
  similar_games?: IGDBGame[];
  rating?: number;              // user rating 0-100
  aggregated_rating?: number;   // critic rating 0-100
  total_rating_count?: number;
  involved_companies?: IGDBCompany[];
}

// ============================================
// processed types
// ============================================
// these are our cleaned up versions of igdb data
// we transform the raw api response into these

// processed screenshot with nullable url (in case transform fails)
export interface ProcessedScreenshot {
  id?: number;
  url: string | null;
}

// game with the cover url already transformed to a usable size
// this is what we actually use in the ui
export interface ProcessedIGDBGame {
  id: number;
  name: string;
  coverUrl: string | null;
  first_release_date?: number;
  summary?: string;
  genres?: IGDBGenre[];
  platforms?: IGDBPlatform[];
  screenshots?: ProcessedScreenshot[];
  similar_games?: ProcessedIGDBGame[];
  rating?: number;
  aggregated_rating?: number;
  total_rating_count?: number;
  involved_companies?: IGDBCompany[];
}

// ============================================
// database types
// ============================================
// these match our prisma schema

// user profile stored in our database
// includes all the gamertags and social links
export interface DBUser {
  id: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  headerUrl: string | null;
  // gamertags - all the different gaming platform ids
  steamId: string | null;
  psnId: string | null;
  xboxGamertag: string | null;
  nintendoFriendCode: string | null;
  eaId: string | null;
  ubisoftId: string | null;
  gogId: string | null;
  // social links
  twitter: string | null;
  instagram: string | null;
  discord: string | null;
  twitch: string | null;
  youtube: string | null;
  createdAt: Date;
}

// a game in a user's library
// stores our own data plus a reference to the igdb game
export interface LibraryGame {
  id: string;               // our internal id (uuid)
  igdbId: number;          // reference to igdb
  name: string;
  coverUrl: string | null;
  summary: string | null;
  genres: string | null;    // comma-separated list
  platforms: string | null; // comma-separated list
  status: GameStatus;
  rating: number | null;    // 0-100
  isFavorite: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// review types
// ============================================

export interface Review {
  id: string;
  content: string;
  rating: number;
  hasSpoilers: boolean;
  upvotes: number;
  downvotes: number;
  gameId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // populated relations
  user?: { id: string; username: string | null; avatarUrl: string | null };
  game?: { id: string; name: string; coverUrl: string | null };
  replies?: ReviewReply[];
  userVote?: 'up' | 'down' | null;
}

export interface ReviewVote {
  id: string;
  isUpvote: boolean;
  reviewId: string;
  userId: string;
  createdAt: Date;
}

export interface ReviewReply {
  id: string;
  content: string;
  reviewId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: { id: string; username: string | null; avatarUrl: string | null };
}

// ============================================
// follow types
// ============================================

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowStats {
  followers: number;
  following: number;
  isFollowing: boolean;
}

// ============================================
// activity types
// ============================================

export type ActivityType = 
  | 'ADDED_GAME'
  | 'COMPLETED_GAME'
  | 'STARTED_GAME'
  | 'DROPPED_GAME'
  | 'REVIEWED_GAME'
  | 'RATED_GAME'
  | 'FAVORITED_GAME'
  | 'FOLLOWED_USER';

export interface Activity {
  id: string;
  type: ActivityType;
  metadata: string; // json string with activity-specific data
  userId: string;
  createdAt: Date;
  user?: { id: string; username: string | null; avatarUrl: string | null };
}

export interface ActivityMetadata {
  gameId?: string;
  gameName?: string;
  gameCoverUrl?: string;
  status?: GameStatus;
  rating?: number;
  followedUserId?: string;
  followedUsername?: string;
}

// ============================================
// component props
// ============================================
// props interfaces for our react components

export interface GameCardProps {
  game: LibraryGame | ProcessedIGDBGame;
  onClick?: () => void;
}

export interface ProfileViewProps {
  user: SerializedClerkUser;
  dbUser: DBUser | null;
  games: LibraryGame[];
  isOwner: boolean;
}

// clerk user data that's safe to serialize (no functions)
export interface SerializedClerkUser {
  id: string;
  imageUrl: string;
  fullName: string | null;
  username: string | null;
}

export interface UserMenuProps {
  dbUser?: {
    avatarUrl?: string | null;
    username?: string | null;
    id?: string;
  } | null;
}

export interface GameDetailsModalProps {
  game: LibraryGame | ProcessedIGDBGame;
  onClose: () => void;
}

export interface EditProfileModalProps {
  user: DBUser | null;
  onClose: () => void;
}

export interface ProfileGameGridProps {
  games: LibraryGame[];
}

// ============================================
// action types
// ============================================
// types for our server actions (form submissions, api calls)

// generic result from a server action
export interface ActionResult {
  success?: boolean;
  error?: string;
  updated?: boolean;
  following?: boolean; // for follow/unfollow actions
}

// data for adding a game to library
export interface AddToLibraryData {
  status: GameStatus;
  rating?: number;
  review?: string;
}

// data for updating profile
export interface UpdateProfileData {
  bio?: string;
  headerUrl?: string;
  avatarUrl?: string;
  steamId?: string;
  psnId?: string;
  xboxGamertag?: string;
  nintendoFriendCode?: string;
  eaId?: string;
  ubisoftId?: string;
  gogId?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  twitch?: string;
  youtube?: string;
}

// ============================================
// ui state types
// ============================================
// types for ui state management

export type SortOption = 'date' | 'name' | 'rating';
export type ModalStep = 'details' | 'form';
export type TabOption = 'overview' | 'media' | 'similar';

// ============================================
// type guards
// ============================================
// helper functions to check what type something is at runtime

// checks if a game is from our library (has string id) vs fresh from igdb (has number id)
export function isLibraryGame(game: LibraryGame | ProcessedIGDBGame): game is LibraryGame {
  return typeof game.id === 'string' && 'userId' in game;
}

// gets the igdb id from either type of game
// library games store it as igdbId, igdb games use id directly
export function getIgdbId(game: LibraryGame | ProcessedIGDBGame): number {
  if (isLibraryGame(game)) {
    return game.igdbId;
  }
  return game.id;
}
