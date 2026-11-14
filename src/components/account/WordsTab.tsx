import { useState } from "react";
import Image from "next/image";

import { Segmented } from "@/components/account/ui";
import { WORDS } from "@/data/words";
import { countByStatus, statusOf } from "@/lib/stats";
import { WordStatus, setWordStatus, useAppState } from "@/lib/store";

type Filter = WordStatus | "all";

// The full list has thousands of words; render them a page at a time.
const PAGE_SIZE = 100;

const BADGE: Record<WordStatus, string> = {
  known: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  learning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  new: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
};

const actionClass =
  "rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-black/5 dark:border-slate-600 dark:hover:bg-white/10";

const WordsTab = () => {
  const { progress } = useAppState();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  const counts = countByStatus(WORDS, progress);

  const words = WORDS.filter(
    (w) =>
      (filter === "all" || statusOf(progress, w.id) === filter) &&
      w.text.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<Filter>
          label="Filter words"
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setShown(PAGE_SIZE);
          }}
          options={[
            { value: "all", label: `All ${WORDS.length}` },
            { value: "learning", label: `Learning ${counts.learning}` },
            { value: "known", label: `Known ${counts.known}` },
            { value: "new", label: `New ${counts.new}` },
          ]}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAGE_SIZE);
          }}
          placeholder="Search…"
          aria-label="Search words"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      {words.length === 0 ? (
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">No words here.</p>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">
          {words.slice(0, shown).map((word) => {
            const status = statusOf(progress, word.id);
            const p = progress[word.id];
            return (
              <li key={word.id} className="flex items-center gap-3 p-3">
                <Image
                  src={word.image}
                  alt=""
                  width={40}
                  height={60}
                  className="h-[60px] w-10 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-semibold">{word.text}</span>{" "}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <i>{word.pos}</i> · {word.level}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className={`mr-2 rounded px-1.5 py-0.5 font-medium ${BADGE[status]}`}>{status}</span>
                    {p && `✓ ${p.correct} · ✕ ${p.wrong}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {status !== "known" && (
                    <button type="button" className={actionClass} onClick={() => setWordStatus(word.id, "known")}>
                      Mark known
                    </button>
                  )}
                  {status === "known" && (
                    <button type="button" className={actionClass} onClick={() => setWordStatus(word.id, "learning")}>
                      Repeat
                    </button>
                  )}
                  {status !== "new" && (
                    <button type="button" className={actionClass} onClick={() => setWordStatus(word.id, "new")}>
                      Reset
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {words.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE_SIZE)}
          className="self-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold hover:bg-black/5 dark:border-slate-600 dark:hover:bg-white/10"
        >
          Show more ({words.length - shown} left)
        </button>
      )}
    </div>
  );
};

export default WordsTab;
