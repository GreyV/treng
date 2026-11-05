import Link from "next/link";

import { Panel } from "@/components/account/ui";
import { WORDS } from "@/data/words";
import { accuracy, countByStatus, lastDays, streak, today } from "@/lib/stats";
import { useAppState } from "@/lib/store";

const StatsTab = () => {
  const { progress, activity, profile } = useAppState();
  const counts = countByStatus(WORDS, progress);
  const day = today(activity);
  const days = streak(activity);
  const acc = accuracy(progress);
  const week = lastDays(activity, 7);
  const barMax = Math.max(profile.dailyGoal, ...week.map((d) => d.reviewed));
  const goalPercent = Math.min(100, Math.round((day.reviewed / profile.dailyGoal) * 100));

  const tiles = [
    { label: "Known", value: counts.known, hint: `of ${WORDS.length} words`, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Learning", value: counts.learning, hint: "to repeat", color: "text-amber-600 dark:text-amber-400" },
    { label: "New", value: counts.new, hint: "not seen yet", color: "text-cyan-600 dark:text-cyan-400" },
    { label: "Streak", value: `🔥 ${days}`, hint: days === 1 ? "day" : "days", color: "" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Panel key={tile.label}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tile.label}</p>
            <p className={`text-3xl font-bold ${tile.color}`}>{tile.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tile.hint}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Today">
        <div className="mb-2 flex items-baseline justify-between">
          <p>
            <span className="text-2xl font-bold">{day.reviewed}</span>
            <span className="text-gray-500 dark:text-gray-400"> / {profile.dailyGoal} cards</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {goalPercent >= 100 ? "Goal reached ✅" : `${goalPercent}% of daily goal`}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
          <div className="h-full rounded-full bg-cyan-600" style={{ width: `${goalPercent}%` }} />
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {day.learned} {day.learned === 1 ? "word" : "words"} learned today
          {acc !== null && ` · ${acc}% right answers overall`}
        </p>
      </Panel>

      <Panel title="Last 7 days">
        <div className="flex h-32 items-end gap-2" role="img" aria-label="Cards reviewed per day, last 7 days">
          {week.map((d) => (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{d.reviewed || ""}</span>
              <div
                className={`w-full max-w-[2.5rem] rounded-t-md ${
                  d.reviewed >= profile.dailyGoal ? "bg-emerald-500" : "bg-cyan-600"
                }`}
                // 85% at most, leaving room for the number above the bar.
                style={{ height: `${(d.reviewed / barMax) * 85}%`, minHeight: d.reviewed ? 4 : 0 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2 border-t border-gray-200 pt-1 dark:border-slate-700">
          {week.map((d) => (
            <span key={d.key} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
              {d.label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Green: daily goal reached.</p>
      </Panel>

      {Object.keys(activity).length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No activity yet.{" "}
          <Link href="/" className="font-semibold text-cyan-600 underline">
            Start learning
          </Link>
        </p>
      )}
    </div>
  );
};

export default StatsTab;
