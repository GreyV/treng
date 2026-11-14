// The Oxford 3000 and 5000 word lists, built by scripts/import-oxford.mjs.
import type { Level } from "@/lib/store";
import { CardData } from "@/types";

import oxford from "./oxford.json";

interface OxfordWord {
  id: string;
  text: string;
  pos: string;
  level: Level;
}

export const WORDS: CardData[] = (oxford as OxfordWord[]).map((word) => ({
  ...word,
  // Placeholder: a random photo, the same one for a word every time.
  image: `https://picsum.photos/seed/${encodeURIComponent(word.id)}/400/600`,
}));
