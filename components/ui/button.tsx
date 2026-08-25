import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-95",
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-5 py-3 text-sm min-h-[44px]",
  lg: "px-7 py-4 text-base min-h-[52px]",
};

// Shared class builder so any element (button, Link, form submit) renders
// the exact same visual language — this is the enforcement mechanism for
// "one global UI" rather than a rule people have to remember.
export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidthMobile = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidthMobile?: boolean;
  className?: string;
} = {}) {
  return [base, variants[variant], sizes[size], fullWidthMobile ? "w-full sm:w-auto" : "", className]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidthMobile?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, fullWidthMobile, className, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, fullWidthMobile, className })}
      {...props}
    />
  )
);
Button.displayName = "Button";
