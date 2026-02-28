import { useEffect, useRef } from 'react';

// Module-level flag: when a modal is closed via UI (not back button),
// we call history.back() to clean up the entry we pushed. If another
// modal opens in the same render cycle (e.g. detail → edit transition),
// the new listener must skip that stray popstate event.
let skipNextPopState = false;

/**
 * Push a history entry when `isOpen` becomes true.
 * Pressing browser back calls `onClose` instead of navigating away.
 * If closed via UI, the pushed history entry is cleaned up automatically.
 */
export default function useBackClose(isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closedByBack = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    closedByBack.current = false;
    window.history.pushState({ modal: true }, '');

    const handlePopState = () => {
      if (skipNextPopState) {
        skipNextPopState = false;
        return;
      }
      closedByBack.current = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If closed via UI (not back button), remove the history entry we pushed
      if (!closedByBack.current) {
        skipNextPopState = true;
        window.history.back();
      }
    };
  }, [isOpen]);
}
