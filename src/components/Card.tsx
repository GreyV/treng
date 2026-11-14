import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";

import CardContent from "@/components/CardContent";

import { CardData, CardHandle, SwipeDirection } from "@/types";

// Projected horizontal travel (px) a drag needs to count as a swipe.
const SWIPE_THRESHOLD = 120;
// Seconds of the release velocity added to the travel, so a short fast flick counts too.
const VELOCITY_WEIGHT = 0.2;
const MAX_ROTATION = 18;
// How much smaller and lower each card under the top one sits.
const STACK_SCALE_STEP = 0.05;
const STACK_OFFSET_STEP = 24;

const SPRING = { type: "spring", stiffness: 300, damping: 25 } as const;

const offscreenX = (dir: SwipeDirection) =>
  (dir === "right" ? 1 : -1) * (window.innerWidth + 200);

interface CardProps {
  card: CardData;
  /** 0 is the top card, 1 is right under it, and so on. */
  depth: number;
  /** Set when the card comes back via undo: it flies in from this side. */
  enterFrom?: SwipeDirection;
  /** The card has started leaving; nothing else should move the deck now. */
  onLeave: () => void;
  /** The card is off screen and can be removed. */
  onSwiped: (dir: SwipeDirection) => void;
  ref?: Ref<CardHandle>;
}

const Card = ({ card, depth, enterFrom, onLeave, onSwiped, ref }: CardProps) => {
  const isTop = depth === 0;
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);

  // Motion values update the DOM directly, so dragging does not re-render React.
  const x = useMotionValue(enterFrom ? offscreenX(enterFrom) : 0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-MAX_ROTATION, 0, MAX_ROTATION]);
  const knowOpacity = useTransform(x, [30, SWIPE_THRESHOLD], [0, 1]);
  const againOpacity = useTransform(x, [-SWIPE_THRESHOLD, -30], [1, 0]);

  useEffect(() => {
    if (enterFrom) animate(x, 0, SPRING);
  }, [enterFrom, x]);

  const flyOut = (dir: SwipeDirection, velocity = 0) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    onLeave();

    animate(
      x,
      offscreenX(dir),
      reduceMotion
        ? { duration: 0 }
        : // The card is already off screen well before the spring settles.
          { type: "spring", stiffness: 200, damping: 30, velocity, restDelta: 50, restSpeed: 200 },
    ).then(() => onSwiped(dir));
  };

  useImperativeHandle(ref, () => ({ swipe: (dir) => flyOut(dir) }));

  const handleDragEnd = (_event: unknown, { offset, velocity }: PanInfo) => {
    const travel = offset.x + velocity.x * VELOCITY_WEIGHT;

    if (Math.abs(travel) > SWIPE_THRESHOLD) {
      flyOut(travel > 0 ? "right" : "left", velocity.x);
      return;
    }

    animate(x, 0, SPRING);
    animate(y, 0, SPRING);
  };

  return (
    // Outer layer: the card's place in the stack.
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 10 - depth }}
      initial={false}
      animate={{ scale: 1 - depth * STACK_SCALE_STEP, y: depth * STACK_OFFSET_STEP }}
      transition={SPRING}
      aria-hidden={!isTop}
    >
      {/* Inner layer: follows the finger. */}
      <motion.div
        className={`relative h-full w-full touch-none select-none overflow-hidden rounded-xl bg-slate-800 shadow-xl ${
          isTop && !leaving ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ x, y, rotate }}
        drag={isTop && !leaving}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <Image
          className="pointer-events-none object-cover"
          src={card.image}
          alt=""
          fill
          sizes="(max-width: 448px) 100vw, 384px"
          draggable={false}
          priority={isTop}
        />

        <motion.span
          style={{ opacity: knowOpacity }}
          className="absolute left-5 top-6 -rotate-12 rounded-md border-4 border-emerald-400 px-2 text-3xl font-extrabold text-emerald-400"
        >
          KNOW
        </motion.span>
        <motion.span
          style={{ opacity: againOpacity }}
          className="absolute right-5 top-6 rotate-12 rounded-md border-4 border-rose-400 px-2 text-3xl font-extrabold text-rose-400"
        >
          AGAIN
        </motion.span>

        <CardContent text={card.text} pos={card.pos} level={card.level} />
      </motion.div>
    </motion.div>
  );
};

export default Card;
