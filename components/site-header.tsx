import Link from "next/link";
import { auth } from "@/auth";
import { roleHome } from "@/lib/role-home";
import { LogoWordmark } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { signOutAction } from "@/lib/auth-actions";

// Used on every route (Webflow §1: nav collapses to hamburger on mobile,
// expands to a top nav on desktop) — the one nav the whole product shares.
// Nav structure itself lives in lib/site-nav.ts (shared with MobileNav).
export async function SiteHeader() {
  const session = await auth();
  const dashboardHref = session?.user ? roleHome(session.user.role as never) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="AIUA home">
          <LogoWordmark />
        </Link>

        <DesktopNav />

        <div className="hidden items-center gap-3 xl:flex">
          {session?.user && dashboardHref ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Profile
              </Link>
              <ButtonLink href={dashboardHref} variant="primary" size="sm">
                Dashboard
              </ButtonLink>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="outline" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" variant="primary" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>

        <MobileNav
          session={
            session?.user && dashboardHref
              ? { name: session.user.name ?? "", dashboardHref }
              : null
          }
        />
      </div>
    </header>
  );
}
