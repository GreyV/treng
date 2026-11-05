// Numbers derived from the saved state, for the learning page and the account page.
import { AppState, DayActivity, Settings, WordProgress, WordStatus, dayKey } from "@/lib/store";

import { CardData } from "@/types";

export const statusOf = (progress: Record<string, WordProgress>, id: string): WordStatus =>
  progress[id]?.status ?? "new";

export function countByStatus(words: CardData[], progress: Record<string, WordProgress>) {
  const counts: Record<WordStatus, number> = { new: 0, learning: 0, known: 0 };
  for (const word of words) counts[statusOf(progress, word.id)] += 1;
  return counts;
}

/** Share of right answers over all answers, 0–100, or null before the first answer. */
export function accuracy(progress: Record<string, WordProgress>): number | null {
  let correct = 0;
  let total = 0;
  for (const p of Object.values(progress)) {
    correct += p.correct;
    total += p.correct + p.wrong;
  }
  return total === 0 ? null : Math.round((correct / total) * 100);
}

const EMPTY_DAY: DayActivity = { reviewed: 0, learned: 0 };

export const today = (activity: AppState["activity"]) => activity[dayKey()] ?? EMPTY_DAY;

/** Days in a row with at least one review, ending today (or yesterday, if today has none yet). */
export function streak(activity: AppState["activity"]): number {
  const day = new Date();
  if (!activity[dayKey(day)]?.reviewed) day.setDate(day.getDate() - 1);

  let count = 0;
  while (activity[dayKey(day)]?.reviewed) {
    count += 1;
    day.setDate(day.getDate() - 1);
  }
  return count;
}

/** The last `n` days, oldest first. */
export function lastDays(activity: AppState["activity"], n: number) {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (n - 1 - i));
    const key = dayKey(date);
    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      ...(activity[key] ?? EMPTY_DAY),
    };
  });
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Words for one learning session: words being learned first (most missed first),
 * then new ones. Known words are left out.
 */
export function buildSession(
  words: CardData[],
  progress: Record<string, WordProgress>,
  settings: Settings,
): CardData[] {
  const learning = words
    .filter((w) => statusOf(progress, w.id) === "learning")
    .sort((a, b) => {
      const pa = progress[a.id];
      const pb = progress[b.id];
      return pb.wrong - pb.correct - (pa.wrong - pa.correct) || pa.lastSeen - pb.lastSeen;
    });
  const fresh = words.filter((w) => statusOf(progress, w.id) === "new");

  const session = [...learning, ...(settings.shuffle ? shuffled(fresh) : fresh)];
  return settings.sessionSize > 0 ? session.slice(0, settings.sessionSize) : session;
}
