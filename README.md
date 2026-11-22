# Treng

A mobile-first web app for learning English vocabulary with swipeable flashcards. Each card shows a picture and a word; swipe right if you know the word, or left to see it again a few cards later.

> **Status:** early prototype. Words come from the Oxford 3000 and 5000 lists, pictures are random placeholders, progress is saved only in the browser, and there are no translations yet.

## Tech stack

- [Next.js](https://nextjs.org/) 16 (Pages Router) and React 19
- TypeScript
- Tailwind CSS 3 and Sass
- [Motion](https://motion.dev/) for dragging and animations

## Getting started

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Swiping is touch-only for now, so on a desktop use your browser's device emulation (in Chrome DevTools: *Toggle device toolbar*).

## Scripts

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server with hot reload |
| `npm run build` | Build for production                 |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |
| `npm run import:oxford` | Rebuild the word list from the Oxford site |

## Project structure

```
src/
├── components/
│   ├── SwipeableCards.tsx   # The deck: queue, stack, buttons, undo
│   ├── Card.tsx             # One card: drag, tilt and fly-out animation
│   ├── CardContent.tsx      # The word shown over the image
│   ├── Layout.tsx           # Header with navigation, wraps every page
│   └── account/             # Account tabs: progress, words, settings, profile
├── data/
│   ├── oxford.json          # Oxford 3000/5000 words (generated)
│   └── words.ts             # Turns them into cards
├── lib/
│   ├── store.ts             # Saved state (localStorage) and actions that change it
│   └── stats.ts             # Counts, streak, session building
├── pages/
│   ├── index.tsx            # Learning page: one session of cards
│   ├── account.tsx          # Account page (?tab=progress|words|settings|profile)
│   └── api/hello.ts         # Placeholder API route from the Next.js template
├── styles/
│   └── globals.scss         # Tailwind layers and global styles
└── types.ts                 # Shared types (CardData, props)
scripts/
└── import-oxford.mjs        # Builds src/data/oxford.json
```

## How it works

- **Cards** are `{ id, text, pos, level, image }` objects from [`src/data/words.ts`](src/data/words.ts), passed to `<SwipeableCards data={...} />`. The picture is a random [picsum](https://picsum.photos/) photo seeded by the word id, so it stays the same for a word but has nothing to do with it.
- **The deck** is a queue; the top three cards are shown as a stack. Swiping right ("know") removes the word. Swiping left ("again") puts it back three cards later (`REQUEUE_GAP` in [`SwipeableCards.tsx`](src/components/SwipeableCards.tsx)). When the queue is empty, a "Start over" button appears.
- **A swipe counts** when the drag distance plus a bit of the release speed passes 120px (`SWIPE_THRESHOLD` and `VELOCITY_WEIGHT` in [`Card.tsx`](src/components/Card.tsx)), so a short fast flick also works. Otherwise the card springs back. Touch and mouse both work.
- **Buttons and keys:** ✕ / ← and ✓ / → swipe the top card with the same animation; ↺, Backspace or Ctrl/Cmd+Z undo the last swipe.
- **Callbacks:** `onSwipeLeft(id)` and `onSwipeRight(id)` on `SwipeableCards` receive the id of the swiped card. Undo calls `onUndo(id, dir)`.
- **Progress** is saved in `localStorage` under `treng:v1` ([`src/lib/store.ts`](src/lib/store.ts)); there is no login, so it stays in one browser. Each swipe updates the word's status (new → learning → known) and today's counts; undo reverts both.
- **Sessions** take the words still being learned first, then new ones, up to the session size from settings. New words start at the English level from the profile and go up, easiest level first; easier words are skipped as most likely known (a C2 learner gets C1 words, the hardest in the list). Within a level, new words are shuffled by a seed saved in settings, so the order is random but the same in every session, and a word keeps its place when others are learned; "New order" in settings picks a new seed. With shuffle off they go in list (alphabetical) order. Known words are skipped.
- **Account** (`/account`) shows progress (counts, today vs. daily goal, streak, last 7 days), the word list with filters and manual status changes, settings (session size, repeat gap, shuffle and a new random order, reset progress) and the profile (name, avatar, level, daily goal).

### Word list

The words are the [Oxford 3000 and 5000](https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000) lists: 5975 entries, each one headword with one part of speech and a CEFR level from A1 to C1. To rebuild [`src/data/oxford.json`](src/data/oxford.json), run `npm run import:oxford` (it downloads the list page) or `npm run import:oxford -- page.html` with a saved copy.

Progress is stored by id, so ids must stay stable. An id is the Oxford entry link plus the part of speech (`abandon_1-verb`, `lie1_1-verb`, `lie2_1-verb`), because one entry can cover several parts of speech and one word can have several entries.

The lists belong to Oxford University Press. They are fine for a prototype; before publishing the app, get permission or switch to an open list such as the CEFR-J Wordlist.

Images are loaded through `next/image`, so any new image host must be allowed in `images.remotePatterns` in [`next.config.js`](next.config.js). Only `picsum.photos` is allowed at the moment.

## Roadmap

- Show the translation or meaning of a word (e.g. flip the card on tap)
- Sign-in and syncing progress between devices
- Pictures that match the word
