# GamesLedger

GamesLedger is a personal game tracking application, similar to Backloggd/Anilist but for video games. Track your gaming journey with beautiful profiles, detailed stats, and a thriving community.

## Features

### Core Features
- **Game Search**: Powered by IGDB API with access to a massive game database
- **Library Management**: Organize games with statuses:
  - Planning to Play
  - Currently Playing
  - Completed
  - Dropped
- **Favorites**: Mark up to 5 games as favorites to showcase on your profile

### Review System
- **Star Ratings**: Rate games from 0-5 stars with 0.5 increments
- **Written Reviews**: Share your thoughts with up to 2000 characters
- **Spoiler Tags**: Mark reviews containing spoilers (hidden by default)
- **Review Voting**: Upvote or downvote helpful reviews
- **Reply System**: Engage with other users' reviews

### Social Features
- **Public Profiles**: Customizable profiles with avatars and headers
- **Follow System**: Follow other users to see their activity
- **Activity Feed**: See what games your friends are playing/completing
- **Gamertags & Socials**: Link your Steam, PSN, Xbox, Discord, Twitter, etc.

### Stats & Analytics
- **Gaming Stats Dashboard**: Completion rate, average rating, games this month
- **Top Genres**: See which genres you play most
- **Platform Breakdown**: Track where you game

### Profile Customization
- **Custom Avatars**: Upload avatars up to 5MB with cropping support
- **Custom Headers**: Wide banner images for your profile
- **Bio**: Tell others about yourself
- **Linked Accounts**: Connect all your gaming platforms

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Auth**: Clerk
- **API**: IGDB (game data)
- **File Uploads**: UploadThing (5MB limit)
- **Icons**: Lucide React + React Icons

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Neon PostgreSQL database
- Clerk account for authentication
- IGDB API credentials
- UploadThing account (optional, for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/taaha17/games-ledger.git
   cd games-ledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file:
   ```env
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   
   # Database
   DATABASE_URL=postgresql://...
   
   # IGDB API
   IGDB_CLIENT_ID=...
   IGDB_CLIENT_SECRET=...
   
   # UploadThing (optional)
   UPLOADTHING_TOKEN=...
   ```

4. **Push database schema**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── actions.ts    # Server Actions
│   ├── profile/      # User's own profile
│   └── u/[userId]/   # Public profile pages
├── components/       # React components
│   ├── activity-feed.tsx
│   ├── edit-profile-modal.tsx
│   ├── follow-button.tsx
│   ├── game-search.tsx
│   ├── profile-view.tsx
│   ├── review-card.tsx
│   ├── review-form.tsx
│   ├── star-rating.tsx
│   ├── stats-card.tsx
│   └── ui/           # Reusable UI components
├── lib/              # Utilities and configs
│   ├── db.ts         # Prisma client
│   ├── igdb.ts       # IGDB API wrapper
│   ├── utils.ts      # Helper functions
│   └── validations.ts
├── types/            # TypeScript types
└── prisma/
    └── schema.prisma # Database schema
```

## Development

- **Branch**: Work on `gamesledger-dev` branch
- **Type Check**: `npx tsc --noEmit`
- **Lint**: `npm run lint`
- **Database GUI**: `npx prisma studio`

## Roadmap

- [ ] Lists (create custom game lists like "Top 10 RPGs")
- [ ] Advanced Search (filter by genre, platform, year, rating)
- [ ] User Achievements
- [ ] Game Backlog Analytics
- [ ] Mobile App

## License

MIT

