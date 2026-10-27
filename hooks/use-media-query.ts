"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks whether a CSS media query currently matches.
 *
 * Uses `useSyncExternalStore` rather than `useState` + `useEffect`: the
 * server snapshot is `false`, and the client subscribes to the media list
 * directly. This avoids calling `setState` inside an effect (which React 19
 * flags) and stays correct across concurrent renders.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
