import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { buttonVariants, type ButtonVariant, type ButtonSize } from "./button";

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidthMobile?: boolean;
  };

// The Link-flavored twin of Button — same visual language, for CTAs that
// navigate instead of submitting a form.
export function ButtonLink({
  variant,
  size,
  fullWidthMobile,
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonVariants({ variant, size, fullWidthMobile, className })} {...props} />;
}
