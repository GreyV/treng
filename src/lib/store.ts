// App state (profile, settings, word progress, daily activity) kept in localStorage.
// There is no login: everything lives in this browser only.
import { useSyncExternalStore } from "react";

export type WordStatus = "new" | "learning" | "known";

export interface WordProgress {
  status: Exclude<WordStatus, "new">;
  correct: number;
  wrong: number;
  /** Unix time in ms of the last answer. */
  lastSeen: number;
}

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

export interface Profile {
  name: string;
  avatar: string;
  level: Level;
  /** Cards to review per day. */
  dailyGoal: number;
}

export interface Settings {
  /** Words per session; 0 means all words that are not known yet. */
  sessionSize: number;
  /** A word swiped left comes back after this many other cards. */
  requeueGap: number;
  /** Show new words in random order instead of list order. */
  shuffle: boolean;
}

export interface DayActivity {
  reviewed: number;
  learned: number;
}

export interface AppState {
  version: 1;
  profile: Profile;
  settings: Settings;
  /** Words without an entry are new. */
  progress: Record<string, WordProgress>;
  /** Keyed by local date, YYYY-MM-DD. */
  activity: Record<string, DayActivity>;
}

const STORAGE_KEY = "treng:v1";

export const DEFAULT_STATE: AppState = {
  version: 1,
  profile: { name: "", avatar: "🙂", level: "A2", dailyGoal: 10 },
  settings: { sessionSize: 10, requeueGap: 3, shuffle: false },
  progress: {},
  activity: {},
};

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw) as Partial<AppState>;
    if (saved.version !== 1) return DEFAULT_STATE;
    // Merge with defaults so fields added later get a value.
    return {
      version: 1,
      profile: { ...DEFAULT_STATE.profile, ...saved.profile },
      settings: { ...DEFAULT_STATE.settings, ...saved.settings },
      progress: saved.progress ?? {},
      activity: saved.activity ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function getSnapshot(): AppState {
  if (!loaded) {
    state = load();
    loaded = true;
  }
  return state;
}

const getServerSnapshot = () => DEFAULT_STATE;

const emit = () => listeners.forEach((listener) => listener());

// Another tab changed the data.
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  state = load();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function setState(update: (prev: AppState) => AppState) {
  state = update(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is full or blocked (private mode): keep working in memory.
  }
  emit();
}

/** Current state outside React (event handlers). */
export const getAppState = () => getSnapshot();

/** The whole app state. On the server and during hydration it is the default state. */
export const useAppState = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

const noopSubscribe = () => () => {};
/** False during server render and hydration, true after: saved data is only known then. */
export const useHydrated = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);

/** Local date as YYYY-MM-DD. */
export const dayKey = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// ---- Actions ----

export const updateProfile = (patch: Partial<Profile>) =>
  setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

export const updateSettings = (patch: Partial<Settings>) =>
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

/** Saves a swipe. Returns the word's previous progress so the answer can be undone. */
export function recordAnswer(id: string, known: boolean): WordProgress | undefined {
  const previous = getSnapshot().progress[id];
  const today = dayKey();

  setState((s) => {
    const prev = s.progress[id];
    const day = s.activity[today] ?? { reviewed: 0, learned: 0 };
    return {
      ...s,
      progress: {
        ...s.progress,
        [id]: {
          status: known ? "known" : "learning",
          correct: (prev?.correct ?? 0) + (known ? 1 : 0),
          wrong: (prev?.wrong ?? 0) + (known ? 0 : 1),
          lastSeen: Date.now(),
        },
      },
      activity: {
        ...s.activity,
        [today]: { reviewed: day.reviewed + 1, learned: day.learned + (known ? 1 : 0) },
      },
    };
  });

  return previous;
}

/** Undoes recordAnswer: puts back the previous progress and takes the answer off today's count. */
export function revertAnswer(id: string, previous: WordProgress | undefined, known: boolean) {
  const today = dayKey();

  setState((s) => {
    const progress = { ...s.progress };
    if (previous) progress[id] = previous;
    else delete progress[id];

    const day = s.activity[today];
    const activity = day
      ? {
          ...s.activity,
          [today]: {
            reviewed: Math.max(0, day.reviewed - 1),
            learned: Math.max(0, day.learned - (known ? 1 : 0)),
          },
        }
      : s.activity;

    return { ...s, progress, activity };
  });
}

/** Changes a word's status by hand (from the account page). Answer counts are kept. */
export function setWordStatus(id: string, status: WordStatus) {
  setState((s) => {
    const progress = { ...s.progress };
    if (status === "new") {
      delete progress[id];
    } else {
      const prev = progress[id];
      progress[id] = {
        correct: prev?.correct ?? 0,
        wrong: prev?.wrong ?? 0,
        lastSeen: prev?.lastSeen ?? Date.now(),
        status,
      };
    }
    return { ...s, progress };
  });
}

/** Forgets all word progress and activity. Profile and settings stay. */
export const resetProgress = () =>
  setState((s) => ({ ...s, progress: {}, activity: {} }));
