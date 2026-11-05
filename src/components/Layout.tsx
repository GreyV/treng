import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";

import { useAppState } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

const NAV = [
  { href: "/", label: "Learn" },
  { href: "/account", label: "Account" },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useRouter();
  const { profile } = useAppState();

  return (
    <div className={`${inter.className} mx-auto flex min-h-screen max-w-2xl flex-col px-4`}>
      <header className="flex items-center justify-between gap-4 py-4">
        <Link href="/" className="leading-tight">
          <span className="block text-lg font-semibold">Treng 😋</span>
          <span className="block text-sm text-gray-500 dark:text-gray-400">Learn English easy!</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-black/5 aria-[current=page]:bg-cyan-600 aria-[current=page]:text-white dark:text-gray-300 dark:hover:bg-white/10"
            >
              {href === "/account" && <span aria-hidden>{profile.avatar}</span>}
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
};

export default Layout;
