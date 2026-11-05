import Head from "next/head";
import { useRouter } from "next/router";

import ProfileTab from "@/components/account/ProfileTab";
import SettingsTab from "@/components/account/SettingsTab";
import StatsTab from "@/components/account/StatsTab";
import WordsTab from "@/components/account/WordsTab";
import { useHydrated } from "@/lib/store";

const TABS = [
  { id: "progress", label: "Progress", Component: StatsTab },
  { id: "words", label: "Words", Component: WordsTab },
  { id: "settings", label: "Settings", Component: SettingsTab },
  { id: "profile", label: "Profile", Component: ProfileTab },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AccountPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  // The open tab is in the URL (?tab=words), so it survives reloads and can be linked to.
  const active = TABS.find((t) => t.id === router.query.tab) ?? TABS[0];

  const openTab = (id: TabId) =>
    router.replace({ query: id === TABS[0].id ? {} : { tab: id } }, undefined, { shallow: true });

  return (
    <>
      <Head>
        <title>Account · Treng</title>
      </Head>

      <h1 className="mb-4 text-2xl font-bold">Account</h1>

      <div
        role="tablist"
        aria-label="Account sections"
        className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-gray-200/70 p-1 dark:bg-slate-800"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tab.id === active.id}
            aria-controls="account-panel"
            onClick={() => openTab(tab.id)}
            className="flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition aria-selected:bg-white aria-selected:text-gray-900 aria-selected:shadow-sm dark:text-gray-300 dark:aria-selected:bg-slate-600 dark:aria-selected:text-white"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="account-panel" aria-labelledby={`tab-${active.id}`}>
        {/* Saved data is only readable in the browser; avoid flashing defaults. */}
        {hydrated ? (
          <active.Component />
        ) : (
          <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800" />
        )}
      </div>
    </>
  );
}
