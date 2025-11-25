# GamesLedger

GamesLedger is a personal game tracking application, similar to Anilist but for video games. It allows you to track games you are playing, planning to play, completed, or abandoned.

## Features

- **Game Search**: Powered by IGDB API to find any game.
- **Library Management**: Add games to your library with statuses:
  - Plan to Play
  - Playing
  - Completed
  - Abandoned
- **Rating & Reviews**: Rate games on a 5-star scale and write personal reviews.
- **Profile**: View your categorized library.
- **Authentication**: Secure sign-in via Clerk.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Auth**: Clerk
- **API**: IGDB

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env` file with the following:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
    CLERK_SECRET_KEY=...
    DATABASE_URL=...
    IGDB_CLIENT_ID=...
    IGDB_CLIENT_SECRET=...
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

