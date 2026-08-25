// Brand mark: a rounded square with a stylized "A" and an accent spark
// (the AI signal). Pure SVG — no stock imagery, scales cleanly at any
// size, themeable via currentColor + the accent token.
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M16 8L21.5 22H18.7L17.6 19H14.4L13.3 22H10.5L16 8ZM16 12.8L14.9 16.5H17.1L16 12.8Z"
        fill="white"
      />
      <circle cx="24.5" cy="8.5" r="2.5" className="fill-accent" />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Logo />
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        AIUA
      </span>
    </span>
  );
}
