"use client";

import { useEffect } from "react";

/**
 * Adds persistent touch-hold hover effect to any element with the
 * `card-interactive` class. The `touch-held` class is applied on
 * touchstart and removed on touchend/touchcancel — mirroring mouse hover.
 */
export default function TouchHoverProvider() {
  useEffect(() => {
    let current: Element | null = null;

    function apply(e: TouchEvent) {
      const target = (e.target as Element).closest(".card-interactive");
      if (target && target !== current) {
        current?.classList.remove("touch-held");
        target.classList.add("touch-held");
        current = target;
      }
    }

    function clear() {
      current?.classList.remove("touch-held");
      current = null;
    }

    document.addEventListener("touchstart", apply, { passive: true });
    document.addEventListener("touchend", clear, { passive: true });
    document.addEventListener("touchcancel", clear, { passive: true });

    return () => {
      document.removeEventListener("touchstart", apply);
      document.removeEventListener("touchend", clear);
      document.removeEventListener("touchcancel", clear);
    };
  }, []);

  return null;
}
