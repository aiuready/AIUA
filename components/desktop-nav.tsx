"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SITE_NAV, hasItems } from "@/lib/site-nav";

// Hover-intent dropdown with a small close delay (so moving the mouse from
// trigger to panel doesn't close it), plus click-to-toggle so it works
// without hover (trackpad taps, keyboard). Escape and blur both close it.
export function DesktopNav() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openNow(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenLabel(label);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpenLabel(null), 150);
  }

  return (
    <nav className="hidden items-center gap-1 xl:flex" onKeyDown={(e) => {
      if (e.key === "Escape") setOpenLabel(null);
    }}>
      {SITE_NAV.map((entry) => {
        if (!hasItems(entry)) {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {entry.label}
            </Link>
          );
        }

        const isOpen = openLabel === entry.label;
        return (
          <div
            key={entry.label}
            className="relative"
            onMouseEnter={() => openNow(entry.label)}
            onMouseLeave={closeSoon}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => setOpenLabel(isOpen ? null : entry.label)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {entry.label}
              <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 min-w-56 rounded-xl border border-border bg-background p-2 shadow-lg"
                onMouseEnter={() => openNow(entry.label)}
                onMouseLeave={closeSoon}
              >
                <Link
                  href={entry.href}
                  role="menuitem"
                  onClick={() => setOpenLabel(null)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {entry.label} overview
                </Link>
                <div className="my-1 border-t border-border" />
                {entry.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpenLabel(null)}
                    className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
