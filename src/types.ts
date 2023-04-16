import { SwipeEventData } from "react-swipeable";

export type { SwipeEventData };

export interface CardData {
  id: string;
  image: string;
  text: string;
}

export interface CardProps {
  card: CardData;
  onSwipeLeft: (eventData: SwipeEventData) => void;
  onSwipeRight: (eventData: SwipeEventData) => void;
  //onSwiping: () => void;
  onSwipeStart: (eventData: SwipeEventData) => void;
  onTap: () => void
  //onCardLeftScreen: (eventData: SwipeEventData) => void;
  current: boolean;
  //onAnimationEnd: () => void;
}

export interface Props {
  data: CardData[];
  onSwipeLeft?: (id: string) => void;
  onSwipeRight?: (id: string) => void;
}
