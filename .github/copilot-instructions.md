<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GamesLedger Project Instructions

## Project Overview
GamesLedger is a personal game tracking application (similar to Backloggd) built with Next.js 16, Clerk, Prisma, and Tailwind CSS.

## Current Status (v0.1)
- **Repository**: `taaha17/games-ledger`
- **Active Branch**: `gamesledger-dev` (Work here!)
- **Stable Branch**: `main`

## Architecture & Conventions
- **Auth**: Clerk (Custom `UserMenu` component used instead of default `UserButton`).
- **Database**: Neon Postgres via Prisma.
- **Images**: Currently storing small images (avatars/headers) as Base64 strings in DB. *Future: Move to S3/UploadThing.*
- **Styling**: Tailwind CSS + Framer Motion.
- **Icons**: `lucide-react` for UI, `react-icons` for brands/socials.
- **Middleware**: Using `src/proxy.ts` (renamed from middleware.ts due to build warnings).

## Completed Features
- [x] Basic Game Search & Library Management (IGDB API).
- [x] Public Profile Pages (`/u/[userId]`).
- [x] Custom User Menu in Header.
- [x] Edit Profile Modal (Bio, Gamertags, Socials, File Uploads).
- [x] Database Schema for Socials/Gamertags.

## Todo / Next Steps
- [ ] **Image Storage**: Migrate from Base64 to a proper object storage solution (UploadThing or AWS S3) to handle larger files and improve performance.
- [ ] **Game Reviews**: Enhance the review system (currently just a text field). Add star ratings/10-point scale visual input.
- [ ] **Social Features**: Follow other users, activity feeds.
- [ ] **Lists**: Create custom lists (e.g., "Top 10 RPGs").
- [ ] **Mobile Responsiveness**: Polish the mobile view for the profile and game grid.
- [ ] **Testing**: Add unit/integration tests.

## Development Workflow
1.  Always work on `gamesledger-dev`.
2.  Use `npm run dev` to test.
3.  Push to `gamesledger-dev` frequently.
4.  Merge to `main` only for releases.

