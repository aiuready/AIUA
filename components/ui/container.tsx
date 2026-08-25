import type { ReactNode } from "react";

// Consistent content width across every page — the "global standard UI"
// only holds if every section uses the same max-width/gutter rhythm
// instead of ad-hoc max-w-* per page.
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
