import type { ReactNode } from "react";

import type { Level } from "@/lib/store";

export interface CardData {
  /** Stable: progress is saved by id. */
  id: string;
  image: string;
  text: string;
  /** Part of speech: "noun", "verb", "adjective"… */
  pos: string;
  /** CEFR level of the word, A1–C1. */
  level: Level;
}

export type SwipeDirection = "left" | "right";

/** Lets the deck swipe the top card from code (buttons, keyboard). */
export interface CardHandle {
  swipe: (dir: SwipeDirection) => void;
}

export interface Props {
  data: CardData[];
  /** A word swiped left comes back after this many other cards. Default 3. */
  requeueGap?: number;
  /** Swipe left: the word is not known yet and will come back later. */
  onSwipeLeft?: (id: string) => void;
  /** Swipe right: the word is known and leaves the deck. */
  onSwipeRight?: (id: string) => void;
  /** The last swipe was undone; the card is back on top. */
  onUndo?: (id: string, dir: SwipeDirection) => void;
  /** Shown instead of the default "All words learned" screen when the deck is empty. */
  emptyState?: ReactNode;
}
