<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GamesLedger Project Instructions

## Project Overview
GamesLedger is a personal game tracking application (similar to Backloggd) built with Next.js 16, Clerk, Prisma, and Tailwind CSS.

## Current Status (v0.2)
- **Repository**: `taaha17/games-ledger`
- **Active Branch**: `gamesledger-dev` (Work here!)
- **Stable Branch**: `main`

## Architecture & Conventions
- **Auth**: Clerk (Custom `UserMenu` component used instead of default `UserButton`).
- **Database**: Neon Postgres via Prisma.
- **Images**: UploadThing for avatars/headers (5MB limit with image cropping).
- **Styling**: Tailwind CSS + Framer Motion.
- **Icons**: `lucide-react` for UI, `react-icons` for brands/socials.
- **Middleware**: Using `src/proxy.ts` (renamed from middleware.ts due to build warnings).

## Completed Features
- [x] Basic Game Search & Library Management (IGDB API).
- [x] Public Profile Pages (`/u/[userId]`).
- [x] Custom User Menu in Header.
- [x] Edit Profile Modal (Bio, Gamertags, Socials, File Uploads).
- [x] Database Schema for Socials/Gamertags.
- [x] Image Storage via UploadThing (5MB, cropping support).
- [x] Review System (0.5-star increments, spoiler tags, voting, replies).
- [x] Follow System (follow/unfollow users).
- [x] Activity Feed (track user actions).
- [x] Stats Dashboard (completion rate, avg rating, top genres).
- [x] Clickable Social Links (Steam, PSN, Xbox, GOG profiles).

## Todo / Next Steps
- [ ] **Lists**: Create custom lists (e.g., "Top 10 RPGs").
- [ ] **Advanced Search**: Filter by genre, platform, year, rating.
- [ ] **Mobile Responsiveness**: Polish the mobile view for the profile and game grid.
- [ ] **Testing**: Add unit/integration tests.
- [ ] **Notifications**: Notify when someone follows you or replies to your review.

## Key Components
- `star-rating.tsx` - Interactive 0-5 star rating with 0.5 increments
- `review-form.tsx` - Review creation/editing with spoiler toggle
- `review-card.tsx` - Review display with voting and replies
- `follow-button.tsx` - Follow/unfollow users
- `activity-feed.tsx` - Display user activities
- `stats-card.tsx` - Gaming statistics dashboard
- `image-cropper.tsx` - Image cropping for avatar/header uploads

## Database Models
- `User` - Profile data, gamertags, socials
- `Game` - Games in user libraries
- `Review` - User reviews with ratings and spoiler flags
- `ReviewVote` - Upvotes/downvotes on reviews
- `ReviewReply` - Replies to reviews
- `Follow` - User follow relationships
- `Activity` - User activity log

## Development Workflow
1.  Always work on `gamesledger-dev`.
2.  Use `npm run dev` to test.
3.  Push to `gamesledger-dev` frequently.
4.  Merge to `main` only for releases.

