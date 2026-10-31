import { useEffect, useRef, useState } from "react";

import Card from "@/components/Card";

import { CardData, CardHandle, Props, SwipeDirection } from "@/types";

// How many cards are rendered as a stack (the rest stay out of the DOM).
const VISIBLE_CARDS = 3;
// A word swiped left comes back after this many other cards.
const REQUEUE_GAP = 3;
const MAX_HISTORY = 50;

// A card can be in the deck more than once over time (each time it is missed),
// so every appearance gets its own key and therefore a fresh component.
interface Entry {
  card: CardData;
  key: string;
}

interface HistoryItem {
  queue: Entry[];
  key: string;
  dir: SwipeDirection;
}

const toEntries = (data: CardData[]): Entry[] =>
  data.map((card) => ({ card, key: `${card.id}:0` }));

const SwipeableCards = ({ data, onSwipeLeft, onSwipeRight }: Props) => {
  const [queue, setQueue] = useState(() => toEntries(data));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [returning, setReturning] = useState<{ key: string; dir: SwipeDirection } | null>(null);
  const [prevData, setPrevData] = useState(data);
  const round = useRef(0);
  // True while the top card is flying out: ignore other swipes and undo until it is gone.
  const busy = useRef(false);
  const topCard = useRef<CardHandle>(null);

  if (data !== prevData) {
    setPrevData(data);
    setQueue(toEntries(data));
    setHistory([]);
    setReturning(null);
  }

  const handleSwiped = (dir: SwipeDirection) => {
    const [top, ...rest] = queue;
    busy.current = false;
    if (!top) return;

    setHistory((prev) => [...prev, { queue, key: top.key, dir }].slice(-MAX_HISTORY));
    setReturning(null);

    if (dir === "right") {
      onSwipeRight?.(top.card.id);
      setQueue(rest);
    } else {
      onSwipeLeft?.(top.card.id);
      round.current += 1;
      const again = { card: top.card, key: `${top.card.id}:${round.current}` };
      setQueue([...rest.slice(0, REQUEUE_GAP), again, ...rest.slice(REQUEUE_GAP)]);
    }
  };

  const swipe = (dir: SwipeDirection) => {
    if (busy.current) return;
    topCard.current?.swipe(dir);
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last || busy.current) return;

    setHistory((prev) => prev.slice(0, -1));
    setQueue(last.queue);
    setReturning({ key: last.key, dir: last.dir });
  };

  const restart = () => {
    setQueue(toEntries(data));
    setHistory([]);
    setReturning(null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") swipe("left");
      else if (event.key === "ArrowRight") swipe("right");
      else if (event.key === "Backspace" || (event.key === "z" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const visible = queue.slice(0, VISIBLE_CARDS);
  const canUndo = history.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
      {/* Bottom margin leaves room for the cards peeking out under the top one. */}
      <div className="relative mb-8 aspect-[2/3] w-full">
        {visible.length > 0 ? (
          // Render bottom cards first so the top card is last in the DOM.
          visible
            .map((entry, depth) => (
              <Card
                key={entry.key}
                ref={depth === 0 ? topCard : undefined}
                card={entry.card}
                depth={depth}
                enterFrom={returning?.key === entry.key ? returning.dir : undefined}
                onLeave={() => (busy.current = true)}
                onSwiped={handleSwiped}
              />
            ))
            .reverse()
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 text-center">
            <p className="text-xl text-gray-500">All words learned! 🎉</p>
            <button
              type="button"
              onClick={restart}
              className="rounded-full bg-cyan-600 px-5 py-2 font-semibold text-white hover:bg-cyan-700"
            >
              Start over
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">{queue.length} left</p>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo last swipe"
          title="Undo (Backspace)"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-amber-500 shadow-md transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => swipe("left")}
          disabled={visible.length === 0}
          aria-label="Don't know yet"
          title="Again (←)"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-rose-500 shadow-md transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => swipe("right")}
          disabled={visible.length === 0}
          aria-label="Know it"
          title="Know (→)"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-emerald-500 shadow-md transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          ✓
        </button>
      </div>
    </div>
  );
};

export default SwipeableCards;
