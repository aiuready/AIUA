"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth-actions";
import { SITE_NAV, hasItems } from "@/lib/site-nav";

export function MobileNav({
  session,
}: {
  session: { name: string; dashboardHref: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function closeAll() {
    setOpen(false);
    setExpanded(null);
  }

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Portaled to document.body rather than rendered in place: the
          header has backdrop-blur (backdrop-filter), which per the CSS
          spec creates a new containing block for `position: fixed`
          descendants - a fixed-positioned scrim/panel nested inside it
          gets trapped at the header's own ~64px box instead of the
          viewport (confirmed via getBoundingClientRect showing a
          collapsed height, not guessed). Portaling escapes that. */}
      {open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-30 bg-foreground/50"
              onClick={closeAll}
              aria-hidden="true"
            />
            <div className="fixed inset-x-0 top-16 z-40 flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-t border-border bg-background px-4 py-4 shadow-lg">
              {SITE_NAV.map((entry) => {
                if (!hasItems(entry)) {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      onClick={closeAll}
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                    >
                      {entry.label}
                    </Link>
                  );
                }

                const isExpanded = expanded === entry.label;
                return (
                  <div key={entry.label} className="flex flex-col">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpanded(isExpanded ? null : entry.label)}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                    >
                      {entry.label}
                      <ChevronDown
                        size={18}
                        className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                        <Link
                          href={entry.href}
                          onClick={closeAll}
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                        >
                          {entry.label} overview
                        </Link>
                        {entry.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeAll}
                            className="rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                {session ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={closeAll}
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                    >
                      Profile
                    </Link>
                    <Link
                      href={session.dashboardHref}
                      onClick={closeAll}
                      className={buttonVariants({ variant: "primary" })}
                    >
                      Dashboard
                    </Link>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className={buttonVariants({ variant: "ghost", className: "w-full" })}
                      >
                        Log out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeAll}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeAll}
                      className={buttonVariants({ variant: "primary" })}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
