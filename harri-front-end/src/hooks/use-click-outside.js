'use client';
import { useEffect, useRef } from "react";

/**
 * Hook that calls `handler` when a click event occurs outside of `ref`.
 * @param {React.RefObject} ref - The ref of the element to detect clicks outside of.
 * @param {Function} handler - The callback to call on outside click.
 */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export default useClickOutside;
