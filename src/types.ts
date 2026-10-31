export interface CardData {
  id: string;
  image: string;
  text: string;
}

export type SwipeDirection = "left" | "right";

/** Lets the deck swipe the top card from code (buttons, keyboard). */
export interface CardHandle {
  swipe: (dir: SwipeDirection) => void;
}

export interface Props {
  data: CardData[];
  /** Swipe left: the word is not known yet and will come back later. */
  onSwipeLeft?: (id: string) => void;
  /** Swipe right: the word is known and leaves the deck. */
  onSwipeRight?: (id: string) => void;
}
