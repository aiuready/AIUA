import Link from "next/link";
import { LogoWordmark } from "@/components/logo";
import { ALL_SCHOOLS, SCHOOL_LABELS } from "@/lib/school-labels";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-3">
          <LogoWordmark />
          <p className="text-sm text-muted-foreground">
            Practical AI skills for African learners — learn, build, and earn
            with a certificate anyone can verify.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Schools
          </h3>
          <ul className="flex flex-col gap-2">
            {ALL_SCHOOLS.map((school) => (
              <li key={school}>
                <Link
                  href={`/courses?school=${school}`}
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  {SCHOOL_LABELS[school]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Platform
          </h3>
          <ul className="flex flex-col gap-2">
            <li><Link href="/courses" className="text-sm text-foreground/80 hover:text-foreground">Browse courses</Link></li>
            <li><Link href="/about" className="text-sm text-foreground/80 hover:text-foreground">About AIUA</Link></li>
            <li><Link href="/verify" className="text-sm text-foreground/80 hover:text-foreground">Verify a certificate</Link></li>
            <li><Link href="/signup" className="text-sm text-foreground/80 hover:text-foreground">Sign up</Link></li>
            <li><Link href="/login" className="text-sm text-foreground/80 hover:text-foreground">Log in</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contact
          </h3>
          {/* Placeholder contact address on the site's own domain — swap for
              the real inbox when one exists. */}
          <a href="mailto:hello@aiuready.africa" className="text-sm text-foreground/80 hover:text-foreground">
            hello@aiuready.africa
          </a>
          <p className="text-sm text-muted-foreground">aiuready.africa</p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {year} AI University Africa. All rights reserved.</span>
          <span>Learn. Build. Earn with AI.</span>
        </div>
      </div>
    </footer>
  );
}
