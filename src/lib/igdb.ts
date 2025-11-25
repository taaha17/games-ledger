const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

// We store the access token in memory so we don't have to ask for a new one every single time.
let accessToken: string | null = null;
let tokenExpiration: number = 0;

/**
 * Helper function to get a valid access token from Twitch/IGDB.
 * It checks if we already have a valid token before making a request.
 */
async function getAccessToken() {
  const now = Date.now();
  // If we have a token and it hasn't expired yet, use it!
  if (accessToken && now < tokenExpiration) {
    return accessToken;
  }

  // Otherwise, ask Twitch for a new token using our Client ID and Secret
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve IGDB access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Set expiration slightly before actual expiration (expires_in is in seconds) to be safe
  tokenExpiration = now + (data.expires_in - 60) * 1000;
  
  return accessToken;
}

/**
 * Searches for games using the IGDB API.
 * @param query The name of the game to search for
 */
export async function searchGames(query: string) {
  const token = await getAccessToken();
  
  // We send a POST request to IGDB with a special query language body
  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID!,
      "Authorization": `Bearer ${token}`,
    },
    // Search for games, return name, cover url, release date, summary, genres, and platforms
    // Simplified filter to ensure we get results
    body: `
      search "${query}"; 
      fields name, cover.url, first_release_date, summary, genres.name, platforms.name; 
      where cover != null; 
      limit 20;
    `,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch games from IGDB");
  }

  return response.json();
}

export async function getPopularGames(offset: number = 0) {
  const token = await getAccessToken();
  
  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID!,
      "Authorization": `Bearer ${token}`,
    },
    // Fetch popular games based on rating count
    body: `
      fields name, cover.url, first_release_date, summary, genres.name, platforms.name, total_rating_count;
      where cover != null & total_rating_count > 20;
      sort total_rating_count desc;
      limit 12;
      offset ${offset};
    `,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch popular games from IGDB");
  }

  return response.json();
}

/**
 * Fetches detailed information for a specific game by ID.
 * @param gameId The IGDB ID of the game
 */
export async function getGameDetails(gameId: number) {
  const token = await getAccessToken();

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID!,
      "Authorization": `Bearer ${token}`,
    },
    body: `
      fields name, cover.url, first_release_date, summary, genres.name, platforms.name, 
      screenshots.url, similar_games.name, similar_games.cover.url, 
      rating, aggregated_rating, involved_companies.company.name;
      where id = ${gameId};
    `,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game details from IGDB");
  }

  const data = await response.json();
  return data[0]; // IGDB returns an array, we want the first (and only) result
}
