import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names, resolving Tailwind conflicts in favour of the last value.
 *
 * `clsx` handles conditional values (strings, arrays, objects).
 * `twMerge` resolves conflicts: `cn("px-2", "px-4")` → `"px-4"`, not `"px-2 px-4"`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
