# Пирожок (Pirozhok) — mobile-first video social network (V1)

A runnable Next.js prototype with real accounts, SQLite data, long videos, Shorts, friends, 1:1 chats, reactions, comments, save folders, profiles, creator tools and an admin panel.

## What is implemented

- Email/password registration, no email confirmation
- Immutable `@username` + editable display name/avatar
- Public profiles and user search
- Author subscriptions (separate from friendship)
- Friend requests and accepted friends
- 1:1 chats; video cards can be shared directly into a chat
- Home: Category 1–5 chips + newest long videos
- Shorts: vertical, full-screen, scroll-snap feed
- Long video page with player, views, likes, dislikes, save, share and comments
- Like/dislike are mutually exclusive
- Save folders like Pinterest boards
- Profile: public profile, likes, saved folders, settings placeholder
- Roles: `user`, `author`, `admin`
- Admin panel: change roles, delete videos
- Creator panel: publish long/short videos by direct URL
- Dark mobile-first UI and fixed bottom navigation

## Local start

Requires Node.js 22.5+ (the project uses the built-in `node:sqlite` module).

```bash
npm install
npm run db:init
npm run dev
```

Open `http://localhost:3000`.

Default local admin created by `npm run db:init`:

- email: `admin@pirozhok.local`
- password: `change-me-now`
- username: `admin`

Change these by setting `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_USERNAME` before `npm run db:init`.

## Add test videos

1. Sign in as admin.
2. Open Profile → Creator.
3. Add a direct `.mp4`/compatible browser video URL and optional thumbnail URL.
4. Pick Long video or Short.

The V1 intentionally uses video URLs rather than local video uploads. This keeps the first version runnable without immediately requiring object storage, transcoding, CDN, quotas, and resumable uploads.

## Database

SQLite file: `data/pirozhok.db` by default. Override with:

```bash
DATABASE_PATH=/absolute/path/pirozhok.db npm run dev
```

For a real public deployment, use a host with persistent disk/volume or replace SQLite with PostgreSQL.

## Not included yet

- Email verification / password reset
- Push notifications / online status / typing indicators
- Group chats
- Followers
- Viewing history
- Premium, virtual currency, streaks, polls, wheel rewards
- Content moderation/reporting
- Large video uploads/transcoding/CDN
- Production rate limiting / anti-spam / abuse controls
