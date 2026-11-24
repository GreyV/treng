import { useState } from "react";

import { Field, Panel, Segmented } from "@/components/account/ui";
import { newShuffleSeed, resetProgress, updateSettings, useAppState } from "@/lib/store";

const SettingsTab = () => {
  const { settings } = useAppState();
  const [confirmReset, setConfirmReset] = useState(false);
  // Shows that "New order" worked: the order itself is only seen on the cards.
  const [reshuffled, setReshuffled] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Learning">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          <Field label="Words per session" hint="Words you are learning come first, then new ones.">
            <Segmented
              label="Words per session"
              value={settings.sessionSize}
              onChange={(sessionSize) => updateSettings({ sessionSize })}
              options={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 0, label: "All" },
              ]}
            />
          </Field>

          <Field
            label="Repeat a missed word after"
            hint="A word swiped left comes back after this many other cards."
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={6}
                value={settings.requeueGap}
                onChange={(e) => updateSettings({ requeueGap: Number(e.target.value) })}
                aria-label="Repeat a missed word after this many cards"
                className="w-48 accent-cyan-600"
              />
              <span className="font-semibold">
                {settings.requeueGap} {settings.requeueGap === 1 ? "card" : "cards"}
              </span>
            </div>
          </Field>

          <Field
            label="Order of new words"
            hint={
              reshuffled
                ? "New order picked. The next session starts with it."
                : settings.shuffle
                  ? "Random, but the same in every session until you pick a new order."
                  : "In list (alphabetical) order."
            }
          >
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.shuffle}
                  onChange={(e) => {
                    updateSettings({ shuffle: e.target.checked });
                    setReshuffled(false);
                  }}
                  className="h-4 w-4 accent-cyan-600"
                />
                Shuffle
              </label>
              <button
                type="button"
                onClick={() => {
                  // Picking a new order only makes sense with shuffle on.
                  updateSettings({ shuffle: true, shuffleSeed: newShuffleSeed() });
                  setReshuffled(true);
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-black/5 dark:border-slate-600 dark:hover:bg-white/10"
              >
                🔀 New order
              </button>
              {settings.shuffle && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Seed: <span className="font-mono text-gray-900 dark:text-gray-100">{settings.shuffleSeed}</span>
                </span>
              )}
            </div>
          </Field>
        </div>
      </Panel>

      <Panel title="Data">
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Progress is saved in this browser only. Resetting forgets known words, history and streak; your
          profile and settings stay.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Reset all progress?</span>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Yes, reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-slate-600 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
          >
            Reset progress
          </button>
        )}
      </Panel>
    </div>
  );
};

export default SettingsTab;
