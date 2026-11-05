import { useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";

import SwipeableCards, { MAX_HISTORY } from "@/components/SwipeableCards";
import { WORDS } from "@/data/words";
import { buildSession, countByStatus, streak, today } from "@/lib/stats";
import { WordProgress, getAppState, recordAnswer, revertAnswer, useAppState, useHydrated } from "@/lib/store";

import { CardData, SwipeDirection } from "@/types";

interface Session {
  id: number;
  words: CardData[];
}

export default function IndexPage() {
  const state = useAppState();
  const hydrated = useHydrated();
  const [session, setSession] = useState<Session | null>(null);
  // Progress before each swipe, so undo can put it back.
  const undoStack = useRef<(WordProgress | undefined)[]>([]);

  // Build the session once saved progress is known. It must not follow every
  // progress change, or each swipe would start a new deck.
  if (hydrated && session === null) {
    setSession({ id: 1, words: buildSession(WORDS, state.progress, state.settings) });
  }

  const startSession = () => {
    const { progress, settings } = getAppState();
    undoStack.current = [];
    setSession((prev) => ({ id: (prev?.id ?? 0) + 1, words: buildSession(WORDS, progress, settings) }));
  };

  const answer = (id: string, known: boolean) => {
    undoStack.current = [...undoStack.current, recordAnswer(id, known)].slice(-MAX_HISTORY);
  };

  const handleUndo = (id: string, dir: SwipeDirection) => {
    revertAnswer(id, undoStack.current.at(-1), dir === "right");
    undoStack.current = undoStack.current.slice(0, -1);
  };

  const day = today(state.activity);
  const goal = state.profile.dailyGoal;
  const days = streak(state.activity);
  const remaining = WORDS.length - countByStatus(WORDS, state.progress).known;

  const sessionDone = (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-slate-600">
      <p className="text-xl font-semibold">Session complete! 🎉</p>
      <p className="text-gray-500 dark:text-gray-400">
        {remaining > 0
          ? `${remaining} ${remaining === 1 ? "word" : "words"} left to learn.`
          : "You know all the words. You can reset them in your account."}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {remaining > 0 && (
          <button
            type="button"
            onClick={startSession}
            className="rounded-full bg-cyan-600 px-5 py-2 font-semibold text-white hover:bg-cyan-700"
          >
            Next session
          </button>
        )}
        <Link
          href="/account"
          className="rounded-full border border-gray-300 px-5 py-2 font-semibold hover:bg-black/5 dark:border-slate-600 dark:hover:bg-white/10"
        >
          See progress
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Treng</title>
        <meta name="description" content="Learn English words with swipeable flashcards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto mb-5 w-full max-w-sm">
        <div className="mb-1.5 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Today: <b className="text-gray-900 dark:text-gray-100">{day.reviewed}</b> / {goal}
          </span>
          {days > 0 && <span>🔥 {days} {days === 1 ? "day" : "days"}</span>}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-cyan-600 transition-[width]"
            style={{ width: `${Math.min(100, (day.reviewed / goal) * 100)}%` }}
          />
        </div>
      </div>

      {session ? (
        <SwipeableCards
          key={session.id}
          data={session.words}
          requeueGap={state.settings.requeueGap}
          onSwipeLeft={(id) => answer(id, false)}
          onSwipeRight={(id) => answer(id, true)}
          onUndo={handleUndo}
          emptyState={sessionDone}
        />
      ) : (
        // Saved progress is not read yet (server render / hydration).
        <div className="mx-auto mb-8 aspect-[2/3] w-full max-w-sm animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800" />
      )}
    </>
  );
}
