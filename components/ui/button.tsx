import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary:
    "border border-black/[.08] hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]",
};

/**
 * Minimal primitive. Replace or extend once you have a real design system.
 * No data fetching, no domain knowledge — see `components/AGENTS.md`.
 *
 * `cn()` merges classes so a caller's `className` overrides the defaults
 * instead of producing duplicated, conflicting Tailwind utilities.
 *
 * Defaults to `type="button"`. A bare `<button>` inside a `<form>` defaults
 * to `type="submit"`, which makes unintended submits far too easy — callers
 * must opt in explicitly with `type="submit"`.
 */
export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
