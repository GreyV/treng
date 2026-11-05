import { ReactNode } from "react";

export const Panel = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    {title && (
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h3>
    )}
    {children}
  </section>
);

interface SegmentedProps<T extends string | number> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of buttons where exactly one is selected. */
export function Segmented<T extends string | number>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className="min-w-[3rem] rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition hover:bg-black/5 aria-checked:border-cyan-600 aria-checked:bg-cyan-600 aria-checked:text-white dark:border-slate-600 dark:hover:bg-white/10"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <div className="py-3 first:pt-0 last:pb-0">
    <p className="mb-2 font-medium">{label}</p>
    {children}
    {hint && <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
);
