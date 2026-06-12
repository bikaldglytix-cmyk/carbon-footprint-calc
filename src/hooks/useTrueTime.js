import { useState, useEffect, useCallback } from 'react';

/**
 * Returns an offset-corrected "true" time so the launch gate can't be bypassed
 * by changing the device clock.
 *
 * It reads the HTTP `Date` header from this site's own server (same-origin — no
 * CORS, no third-party time API to go down), measures round-trip latency, and
 * derives an offset from the local clock. If anything fails or is slow, it times
 * out and falls back to the local clock so the app NEVER hangs on a blank screen.
 */
export function useTrueTime() {
  const [offset, setOffset] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncTime() {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000); // never hang

        const start = Date.now();
        const res = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timer);
        const end = Date.now();

        const dateHeader = res.headers.get('date');
        if (!dateHeader) throw new Error('No Date header on response');

        const serverTime = new Date(dateHeader).getTime();
        if (Number.isNaN(serverTime)) throw new Error('Unparseable Date header');

        const latency = (end - start) / 2;
        const calculatedOffset = (serverTime + latency) - Date.now();

        if (!cancelled) {
          setOffset(calculatedOffset);
          setIsSynced(true);
        }
      } catch (e) {
        console.error('True-time sync failed; using local clock.', e);
        if (!cancelled) {
          setOffset(0);
          setIsSynced(true);
        }
      }
    }

    syncTime();
    return () => { cancelled = true; };
  }, []);

  const getTrueTime = useCallback(() => Date.now() + offset, [offset]);

  return { getTrueTime, isSynced };
}
